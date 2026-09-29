// Every project on the site, with its case study. The home page shows the tease
// (name, pitch, image); /projects/:slug renders the rest. Block types mirror
// Upstatement's case-study content blocks — see upstatement-design.md § Case studies.

// Vite fingerprints and serves these; the import gives back the final URL.
import frogodoroBgSelection from "../assets/frogodoro-bg-selection-page.jpg";
import frogodoroLogin from "../assets/frogodoro-login-page.jpg";
import frogodoroMain from "../assets/frogodoro-main-page.jpg";
import frogodoroSettings from "../assets/frogodoro-settings-page.jpg";
import frogodoroVivarium from "../assets/frogodoro-vivarium-bg.jpg";
import frogodoroMainPageRecording from "../assets/frogodoro-main-page-recording.mp4";
import earlyFrogodoroImplementation from "../assets/early-frogodoro-implementation.jpg";
import frogLocationSelection from "../assets/frog-location-selection.jpg";
import frogInspoVideo from "../assets/frog-inspo-video.mp4";
import frogInspo1 from "../assets/frog-inspo1.jpg";
import frogInspo2 from "../assets/frog-inspo2.jpg";

/** How wide a block sits: text column (780px), medium (1100px), full page width,
 *  or breakout (edge to edge, no gutter, square corners). */
export type BlockAlign = "text" | "medium" | "full" | "breakout";

export type CaseStudyBlock =
  | {
      type: "text";
      heading?: string;
      paragraphs: string[];
      list?: string[];
      /** Half-row image on one side with the text wrapping around it on desktop; above the text on phones. */
      sideImage?: CaseStudyImage & { side: "left" | "right" };
    }
  | ({ type: "image"; align: BlockAlign } & CaseStudyImage)
  /** Smaller images, two to a row on desktop. A lone image sits centered at the same size. */
  | { type: "gallery"; images: CaseStudyImage[] };

export type CaseStudyImage = {
  alt: string;
  /** Missing = placeholder at the given aspect ratio until a real asset exists. */
  src?: string;
  aspectRatio?: string;
  caption?: string;
  /** Shown after the caption, e.g. crediting an asset's source. */
  link?: { label: string; href: string };
};

export type Project = {
  slug: string;
  name: string;
  /** One line. Read as "Name: pitch" on the tease and bold under the title on the case study. */
  pitch: string;
  tags: string[];
  githubUrl: string;
  liveUrl?: string;
  /** 16:9 tease screenshots. The second fades in on hover. */
  image?: string;
  hoverImage?: string;
  caseStudy: {
    introduction: string;
    /** The two columns under the introduction, like Upstatement's "What We Did / What We Made". */
    columns: { header: string; items: string[] }[];
    heroImage?: string;
    heroAlt: string;
    blocks: CaseStudyBlock[];
  };
};


export const PROJECTS: Project[] = [
  {
    slug: "frogodoro",
    name: "Frogodoro",
    pitch: "A frog-themed Pomodoro timer with lo-fi music, animated scenes, and Firebase-synced stats",
    tags: ["React", "Vite", "Tailwind CSS", "Firebase"],
    githubUrl: "https://github.com/NGHades/frogodoro",
    liveUrl: "https://frogodoro-alpha.vercel.app/",
    image: frogodoroVivarium,
    hoverImage: frogodoroMain,
    caseStudy: {
      introduction:
        "Frogodoro is a Pomodoro timer that pairs focused work sessions with a hopping frog, lo-fi background music, and a handful of relaxing scenes to work in front of. Work in focused bursts, take short and long breaks, and optionally sign in to track your stats across sessions.",
      columns: [
        {
          header: "Tech Stack",
          items: ["React 19 + React Compiler", "Vite 7", "Tailwind CSS 4", "Firebase Auth + Firestore", "GitHub Actions CI"],
        },
        {
          header: "What I Built",
          items: ["Pomodoro timer", "Animated frog companion", "Lo-fi music player", "Six scene backgrounds", "Stats and streaks"],
        },
      ],
      heroImage: frogodoroMainPageRecording,
      heroAlt: "Frogodoro's timer over the vivarium scene",
      blocks: [
        {
          type: "text",
          heading: "The idea",
          paragraphs: [
            `Productivity is a constant buzzword used by college students and working professionals. With time as a fleeting resource
            and focus as a necessary commodity, creating a Pomodoro timer that I would use felt necessary. Other timers worked well, but they
            were missing one thing: frogs.`,
            `A frog aesthetic, that's the entire goal of this project. To push the "Frog Army" one step closer to domination.`
          ],
        },
        {
          type: "image",
          align: "text",
          src: frogodoroVivarium,
          alt: "The main timer screen: mode buttons, the frog perched on the timer ring, and playback controls, over the river landscape",
        },
        {
          type: "text",
          heading: "What it does",
          paragraphs: [
            "Work in focused bursts, take short and long breaks, and let the frog keep you company while you do.",
          ],
          list: [
            "Configurable focus, short break, and long break durations",
            "An animated frog that idles and hops along as the session runs",
            "Separate lo-fi tracks for focus and break modes, with mute control",
            "Six backgrounds: river landscape, koi pond, vivarium, sunset lake, waterfall, and desert",
            "Optional auto-start for the next break or pomodoro",
            "Sessions completed, total focus minutes, current streak, and longest streak",
          ],
        },
        {
          type: "image",
          align: "text",
          src: frogodoroSettings,
          alt: "The timer preferences, with focus and break durations and auto-start toggles",
          caption: "Durations and auto-start live in one panel, saved locally or to your account.",
        },
        {
          type: "image",
          align: "text",
          src: frogodoroBgSelection,
          alt: "The background picker, with River Landscape selected next to Koi Pond",
          caption: "Six scenes to work in front of, from a river landscape to a koi pond.",
        },
        {
          type: "text",
          heading: "Stack and architecture",
          paragraphs: [
            "React 19 with the React Compiler, built with Vite 7 and styled with Tailwind CSS 4. The timer ring is react-circular-progressbar, audio runs through use-sound, and Firebase handles accounts and stores settings and stats in Firestore. GitHub Actions lints and builds every push and PR to main.",
            `I had previous experience with React and JavaScript, but this project was my first time using any BaaS, sounds, and Tailwind.`,
            `After using Tailwind, I understand why so many people love it. Inline CSS keeps you in the moment andd allows for a constant workflow,
            similar to the goal of all Pomodoro timers.`,
            `Firebase, on the other hand, was a much more whimsical decision based on stolen valor. 
            One of the main inspos for this project had a Firestore auth which gave me the idea to set it up, even if there were few users.`
          ],
        },
        {
          type: "text",
          heading: "Works without an account",
          paragraphs: [
            `Signing in is optional. Timer settings and the chosen background persist in localStorage, 
              so the app is fully usable without Firebase — an account only adds cross-device sync and stats.`,
          ],
        },
        {
          type: "image",
          align: "text",
          src: frogodoroLogin,
          alt: "The account tab's login form, with a link to sign up",
          caption: "An account is one tab in preferences — skip it and everything still works.",
        },
        {
          type: "text",
          heading: "Design and inspiration",
          paragraphs: [
            `Before writing any code, I put together some basic Figma designs: an early take on the timer screen and a sketch of
            the location/scene selection. Nothing fancy, just enough to see how the timer, buttons, and backgrounds would sit together.`,
          ],
          sideImage: {
            side: "right",
            src: frogLocationSelection,
            alt: "A Figma sketch of the timer over a pixel-art living room, with several frogs scattered around it",
            caption: "A rough sketch of the location selection, trying the timer over a cozy pixel-art room.",
          },
        },
        {
          type: "text",
          paragraphs: [
            `The first sprite I found was the one that made me want to keep going with frogs. Seeing it move made the whole idea click.`,
          ],
          sideImage: { side: "left", src: frogInspoVideo, alt: "The first animated frog sprite that inspired the project" },
        },
        {
          type: "text",
          paragraphs: [
            `From there, I looked at frog art with color schemes closer to what I wanted: soft greens, thick outlines, and a round,
            friendly shape.`,
          ],
          sideImage: {
            side: "right",
            src: frogInspo1,
            alt: "Two round, light-green cartoon frogs with thick black outlines",
            caption: "Frog art with the color schemes I was going for.",
          },
        },
        {
          type: "text",
          paragraphs: [
            `In the end, it was the coziness of the buttons and the font that decided the final frog sprite. It had to feel like it
            belonged next to the rounded, soft-green controls, and the one from the pixel asset pack fit right in.`,
          ],
          sideImage: {
            side: "left",
            src: frogInspo2,
            alt: "A round green cartoon frog with pink cheeks wearing a red, white-spotted mushroom cap",
          },
        },
        {
          type: "gallery",
          images: [
            {
              src: earlyFrogodoroImplementation,
              alt: "An early Figma design: a translucent timer card with a green ring and a small pixel frog, over a pixel-art mountain lake",
              caption: "An early Figma pass at the timer screen, with the frog sprite that made the final cut.",
              link: { label: "Frogs pixel asset pack", href: "https://pop-shop-packs.itch.io/frogs-pixel-asset-pack" },
            },
          ],
        },
        {
          type: "text",
          heading: "Looking back",
          paragraphs: [
            `This was a very frontend-focused application, so the UI and components were the hardest problems that I felt had to be perfect.`,
            `Choosing the color palette, the background inspiration, the font, and even the type of music were things I never imagined spending days on.
            I've always been interested in art, but I never connected art and coding as two disciplines that had a bridge. That line between the two blurred
            as I kept creating and iterating on the design.`,
            `Next time, I would do more developed inspiration research/case study work and be more specific about the architecture before even starting.`
          ],
        },
      ],
    },
  },
  {
    slug: "dermcat",
    name: "DermCat",
    pitch: "TODO: one-line pitch",
    tags: [],
    githubUrl: "https://github.com/NGHades/DermCat",
    caseStudy: {
      introduction: "TODO: Two or three sentences on what DermCat is and who it's for.",
      columns: [
        { header: "Tech Stack", items: ["TODO"] },
        { header: "What I Built", items: ["TODO"] },
      ],
      heroAlt: "DermCat screenshot",
      blocks: [
        { type: "text", heading: "The idea", paragraphs: ["TODO: The problem and why you took it on."] },
        { type: "image", align: "full", alt: "DermCat in use", aspectRatio: "16 / 9" },
        { type: "text", heading: "Decisions", paragraphs: ["TODO: Two to four decisions, the alternatives, and the tradeoff."] },
        { type: "text", heading: "Looking back", paragraphs: ["TODO: What you'd do differently."] },
      ],
    },
  },
  {
    slug: "rag-for-neanderthals",
    name: "rag-for-neanderthals",
    pitch: "TODO: one-line pitch",
    tags: [],
    githubUrl: "https://github.com/NGHades/rag-for-neanderthals",
    caseStudy: {
      introduction: "TODO: Two or three sentences on what rag-for-neanderthals is and who it's for.",
      columns: [
        { header: "Tech Stack", items: ["TODO"] },
        { header: "What I Built", items: ["TODO"] },
      ],
      heroAlt: "rag-for-neanderthals screenshot",
      blocks: [
        { type: "text", heading: "The idea", paragraphs: ["TODO: The problem and why you took it on."] },
        { type: "image", align: "full", alt: "rag-for-neanderthals in use", aspectRatio: "16 / 9" },
        { type: "text", heading: "Decisions", paragraphs: ["TODO: Two to four decisions, the alternatives, and the tradeoff."] },
        { type: "text", heading: "Looking back", paragraphs: ["TODO: What you'd do differently."] },
      ],
    },
  },
];

export function findProject(slug: string | undefined): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

/** The next two projects after this one, wrapping around — for the "Up Next" teases. */
export function upNext(slug: string, count = 2): Project[] {
  const index = PROJECTS.findIndex((project) => project.slug === slug);
  return Array.from({ length: Math.min(count, PROJECTS.length - 1) }, (_, i) => PROJECTS[(index + 1 + i) % PROJECTS.length]);
}
