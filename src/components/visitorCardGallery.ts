// The 3D half of the Visitor Gallery: a drifting pile of Visitor Cards you can
// drag around and click to bring forward. Kept as a plain class so the React
// component that owns it stays a thin wrapper — nothing here touches the DOM
// beyond its own <canvas>.

import * as THREE from "three";
import type { VisitorCard } from "../data/visitorCards";
import { CARD_ASPECT, createVisitorCardCanvas } from "./visitorCardFace";

const FOV = 45;
const CAMERA_Z = 7;
/** Depth a selected card flies to — closer to the camera than any resting card. */
const FOCUS_Z = 3;
const FOCUS_Y = 0.18;
/** Pointer travel (px) past which a press counts as a drag rather than a click. */
const CLICK_SLOP = 6;

type CardEntry = {
  card: VisitorCard;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  texture: THREE.CanvasTexture;
  /** Resting place. Updated when a card is dropped somewhere new. */
  home: THREE.Vector3;
  baseRot: THREE.Euler;
  /** Offsets this card's drift so the pile doesn't bob in unison. */
  phase: number;
  /** False until the first layout, which snaps the card into place. */
  placed: boolean;
};

type DragState = {
  entry: CardEntry;
  pointerId: number;
  plane: THREE.Plane;
  /** Grab point relative to the card's origin, in root-local space. */
  grabOffset: THREE.Vector3;
  target: THREE.Vector3;
  startX: number;
  startY: number;
  moved: boolean;
};

export type VisitorCardGalleryOptions = {
  canvas: HTMLCanvasElement;
  onSelect: (id: string | null) => void;
  reducedMotion?: boolean;
};

/** Stable per-index jitter, so a resize re-lays-out to the same scatter. */
function hash01(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const smooth = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);

export class VisitorCardGallery {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  private readonly root = new THREE.Group();
  private readonly geometry = new THREE.PlaneGeometry(1, 1);
  private readonly raycaster = new THREE.Raycaster();
  private readonly clock = new THREE.Clock();
  private readonly onSelectCallback: (id: string | null) => void;

  private entries: CardEntry[] = [];
  private pointer = new THREE.Vector2();
  private pointerInside = false;
  private drag: DragState | null = null;
  private hovered: CardEntry | null = null;
  private selectedId: string | null = null;
  private reducedMotion: boolean;

  private cardW = 2.6;
  private cardH = 1.5;
  private focusScale = 1.2;
  /** Half-extents a dropped card is clamped to, so nothing gets thrown offscreen. */
  private bounds = new THREE.Vector2(5, 2.4);
  private parallax = 0;

  private raf = 0;
  private active = true;

  private readonly tmpVec = new THREE.Vector3();
  private readonly tmpVec2 = new THREE.Vector3();
  private readonly tmpPos = new THREE.Vector3();
  private readonly tmpRot = new THREE.Vector3();

  constructor({ canvas, onSelect, reducedMotion = false }: VisitorCardGalleryOptions) {
    this.canvas = canvas;
    this.onSelectCallback = onSelect;
    this.reducedMotion = reducedMotion;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera.position.z = CAMERA_Z;
    this.scene.add(this.root);

    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerUp);
    canvas.addEventListener("pointerleave", this.onPointerLeave);

    this.raf = requestAnimationFrame(this.tick);
  }

  /* ---------------------------------------------------------------- *
   * Public API
   * ---------------------------------------------------------------- */

  setCards(cards: VisitorCard[]) {
    const byId = new Map(this.entries.map((entry) => [entry.card.id, entry]));
    const next: CardEntry[] = [];

    for (const card of cards) {
      const existing = byId.get(card.id);
      if (existing) {
        byId.delete(card.id);
        existing.card = card;
        next.push(existing);
        continue;
      }
      next.push(this.createEntry(card));
    }

    for (const stale of byId.values()) this.disposeEntry(stale);

    this.entries = next;
    this.layout();
  }

  select(id: string | null) {
    if (this.selectedId === id) return;
    this.selectedId = id;
    this.onSelectCallback(id);
  }

  setReducedMotion(reducedMotion: boolean) {
    this.reducedMotion = reducedMotion;
  }

  /** Pauses the render loop while the gallery is scrolled out of view. */
  setActive(active: boolean) {
    if (this.active === active) return;
    this.active = active;
    if (active) this.clock.getDelta();
  }

  resize(width: number, height: number) {
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.layout();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    for (const entry of this.entries) this.disposeEntry(entry);
    this.entries = [];
    this.geometry.dispose();
    // dispose() alone leaves the WebGL context alive on the canvas; drop it so a
    // remount (StrictMode, hot reload) doesn't stack up contexts.
    this.renderer.forceContextLoss();
    this.renderer.dispose();
  }

  /* ---------------------------------------------------------------- *
   * Scene construction
   * ---------------------------------------------------------------- */

  private createEntry(card: VisitorCard): CardEntry {
    const texture = new THREE.CanvasTexture(createVisitorCardCanvas(card));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      // Transparent planes are sorted back-to-front by three, so skipping depth
      // writes is what lets overlapping cards blend instead of punching holes.
      depthWrite: false,
      toneMapped: false,
    });

    const mesh = new THREE.Mesh(this.geometry, material);
    this.root.add(mesh);

    return {
      card,
      mesh,
      texture,
      home: new THREE.Vector3(),
      baseRot: new THREE.Euler(),
      phase: 0,
      placed: false,
    };
  }

  private disposeEntry(entry: CardEntry) {
    this.root.remove(entry.mesh);
    entry.mesh.material.dispose();
    entry.texture.dispose();
    if (this.hovered === entry) this.hovered = null;
    if (this.drag?.entry === entry) this.drag = null;
  }

  /** Scatters the cards across the viewport on a jittered grid. */
  private layout() {
    const count = this.entries.length;
    if (count === 0) return;

    const viewH = 2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z;
    const viewW = viewH * this.camera.aspect;

    this.cardH = Math.min(viewH * 0.27, (viewW * 0.68) / CARD_ASPECT);
    this.cardW = this.cardH * CARD_ASPECT;

    // Scale a focused card against the viewport at FOCUS_Z, not at z=0 — it sits
    // closer to the camera, so the same world size covers much more of the frame.
    const focusH = 2 * Math.tan((FOV * Math.PI) / 360) * (CAMERA_Z - FOCUS_Z);
    const focusW = focusH * this.camera.aspect;
    this.focusScale = Math.min((focusH * 0.62) / this.cardH, (focusW * 0.88) / this.cardW);

    const cols = Math.max(1, Math.min(count, Math.round(Math.sqrt((count * viewW) / (viewH * CARD_ASPECT)))));
    const rows = Math.ceil(count / cols);
    const cellW = (viewW * 0.94) / cols;
    const cellH = (viewH * 0.92) / rows;

    this.bounds.set(Math.max(viewW / 2 - this.cardW * 0.3, 0.1), Math.max(viewH / 2 - this.cardH * 0.3, 0.1));

    this.entries.forEach((entry, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // The last row is usually short — centre it under the full ones.
      const inRow = Math.min(cols, count - row * cols);
      const rowOffset = (cols - inRow) / 2;

      const x = (col + rowOffset + 0.5 - cols / 2) * cellW + (hash01(i * 3 + 1) - 0.5) * cellW * 0.22;
      const y = (rows / 2 - row - 0.5) * cellH + (hash01(i * 3 + 2) - 0.5) * cellH * 0.22;
      const z = (hash01(i * 3 + 3) - 0.5) * 1.3;

      entry.home.set(x, y, z);
      entry.baseRot.set(
        (hash01(i * 7 + 1) - 0.5) * 0.16,
        (hash01(i * 7 + 2) - 0.5) * 0.36,
        (hash01(i * 7 + 3) - 0.5) * 0.24,
      );
      entry.phase = hash01(i * 11 + 5) * Math.PI * 2;

      // Place instantly on first layout so cards don't fly in from the origin.
      if (!entry.placed) {
        entry.placed = true;
        entry.mesh.position.copy(entry.home);
        entry.mesh.rotation.copy(entry.baseRot);
        entry.mesh.scale.set(this.cardW, this.cardH, 1);
      }
    });
  }

  /* ---------------------------------------------------------------- *
   * Pointer handling
   * ---------------------------------------------------------------- */

  private updatePointer(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  }

  private pick(): CardEntry | null {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(
      this.entries.map((entry) => entry.mesh),
      false,
    );
    if (hits.length === 0) return null;
    const mesh = hits[0].object;
    return this.entries.find((entry) => entry.mesh === mesh) ?? null;
  }

  private onPointerDown = (e: PointerEvent) => {
    this.pointerInside = true;
    this.updatePointer(e);
    const entry = this.pick();

    if (!entry) {
      this.select(null);
      return;
    }

    this.canvas.setPointerCapture(e.pointerId);

    // Drag along a plane facing the camera through the card's current position,
    // so the card tracks the cursor exactly regardless of its depth.
    const plane = new THREE.Plane();
    this.camera.getWorldDirection(this.tmpVec);
    entry.mesh.getWorldPosition(this.tmpVec2);
    plane.setFromNormalAndCoplanarPoint(this.tmpVec, this.tmpVec2);

    const grabOffset = new THREE.Vector3();
    this.raycaster.setFromCamera(this.pointer, this.camera);
    if (this.raycaster.ray.intersectPlane(plane, this.tmpVec)) {
      this.root.worldToLocal(this.tmpVec);
      grabOffset.copy(this.tmpVec).sub(entry.mesh.position);
    }

    this.drag = {
      entry,
      pointerId: e.pointerId,
      plane,
      grabOffset,
      target: entry.mesh.position.clone(),
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    this.canvas.style.cursor = "grabbing";
  };

  private onPointerMove = (e: PointerEvent) => {
    this.pointerInside = true;
    this.updatePointer(e);

    const drag = this.drag;
    if (!drag || drag.pointerId !== e.pointerId) {
      this.hovered = this.pick();
      this.canvas.style.cursor = this.hovered ? "grab" : "default";
      return;
    }

    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > CLICK_SLOP) drag.moved = true;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    if (!this.raycaster.ray.intersectPlane(drag.plane, this.tmpVec)) return;
    this.root.worldToLocal(this.tmpVec);
    drag.target.copy(this.tmpVec).sub(drag.grabOffset);
    drag.target.x = THREE.MathUtils.clamp(drag.target.x, -this.bounds.x, this.bounds.x);
    drag.target.y = THREE.MathUtils.clamp(drag.target.y, -this.bounds.y, this.bounds.y);
  };

  private onPointerUp = (e: PointerEvent) => {
    const drag = this.drag;
    if (!drag || drag.pointerId !== e.pointerId) return;

    if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId);
    this.drag = null;
    this.canvas.style.cursor = "grab";

    if (drag.moved) {
      // Dropped cards stay where you put them and resume drifting from there.
      drag.entry.home.x = drag.target.x;
      drag.entry.home.y = drag.target.y;
    } else {
      this.select(this.selectedId === drag.entry.card.id ? null : drag.entry.card.id);
    }
  };

  private onPointerLeave = () => {
    this.pointerInside = false;
    this.hovered = null;
    this.canvas.style.cursor = "default";
  };

  /* ---------------------------------------------------------------- *
   * Frame loop
   * ---------------------------------------------------------------- */

  private tick = () => {
    this.raf = requestAnimationFrame(this.tick);

    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.active) return;
    const t = this.clock.elapsedTime;

    // Whole-pile parallax follows the cursor, but stands down while a card is
    // focused so the focused card doesn't swing around with it.
    const wantsParallax = this.pointerInside && !this.selectedId && !this.reducedMotion;
    this.parallax += (Number(wantsParallax) - this.parallax) * smooth(4, dt);
    this.root.rotation.y += (this.pointer.x * 0.14 * this.parallax - this.root.rotation.y) * smooth(3, dt);
    this.root.rotation.x += (-this.pointer.y * 0.1 * this.parallax - this.root.rotation.x) * smooth(3, dt);

    for (const entry of this.entries) {
      const isSelected = entry.card.id === this.selectedId;
      const isDragging = this.drag?.entry === entry;
      const isHovered = this.hovered === entry && !this.drag;
      const somethingElseSelected = this.selectedId !== null && !isSelected;

      let scaleFactor: number;
      let opacity = 1;

      if (isSelected) {
        this.tmpPos.set(0, FOCUS_Y, FOCUS_Z);
        this.tmpRot.set(0, 0, 0);
        scaleFactor = this.focusScale;
      } else if (isDragging) {
        this.tmpPos.copy(this.drag!.target).setZ(entry.home.z + 1);
        // Lean into the direction of travel — reads as weight behind the drag.
        this.tmpRot.set(
          THREE.MathUtils.clamp((this.tmpPos.y - entry.mesh.position.y) * 0.5, -0.3, 0.3),
          THREE.MathUtils.clamp((this.tmpPos.x - entry.mesh.position.x) * 0.5, -0.3, 0.3),
          entry.baseRot.z * 0.3,
        );
        scaleFactor = 1.07;
      } else {
        const bob = this.reducedMotion ? 0 : Math.sin(t * 0.55 + entry.phase) * 0.07;
        this.tmpPos.set(
          entry.home.x,
          entry.home.y + bob,
          entry.home.z + (isHovered ? 0.5 : 0) - (somethingElseSelected ? 0.7 : 0),
        );
        const wobble = this.reducedMotion ? 0 : 1;
        this.tmpRot.set(
          entry.baseRot.x + Math.sin(t * 0.37 + entry.phase) * 0.035 * wobble,
          entry.baseRot.y + Math.sin(t * 0.43 + entry.phase * 1.3) * 0.06 * wobble,
          entry.baseRot.z + Math.sin(t * 0.51 + entry.phase * 0.7) * 0.03 * wobble,
        );
        scaleFactor = isHovered ? 1.05 : 1;
        if (somethingElseSelected) {
          scaleFactor *= 0.92;
          opacity = 0.25;
        }
      }

      const posLambda = isDragging ? 18 : 6;
      entry.mesh.position.lerp(this.tmpPos, smooth(posLambda, dt));

      const rotLambda = smooth(isDragging ? 10 : 4, dt);
      entry.mesh.rotation.x += (this.tmpRot.x - entry.mesh.rotation.x) * rotLambda;
      entry.mesh.rotation.y += (this.tmpRot.y - entry.mesh.rotation.y) * rotLambda;
      entry.mesh.rotation.z += (this.tmpRot.z - entry.mesh.rotation.z) * rotLambda;

      const scaleLambda = smooth(8, dt);
      entry.mesh.scale.x += (this.cardW * scaleFactor - entry.mesh.scale.x) * scaleLambda;
      entry.mesh.scale.y += (this.cardH * scaleFactor - entry.mesh.scale.y) * scaleLambda;

      entry.mesh.material.opacity += (opacity - entry.mesh.material.opacity) * smooth(8, dt);
    }

    this.renderer.render(this.scene, this.camera);
  };
}
