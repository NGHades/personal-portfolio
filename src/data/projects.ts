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

/** How wide a block sits: text column (780px), medium (1100px), full page width,
 *  or breakout (edge to edge, no gutter, square corners). */
export type BlockAlign = "text" | "medium" | "full" | "breakout";

export type CaseStudyBlock =
  | {
      type: "text";
      heading?: string;
      paragraphs: string[];
      list?: string[];
    }
  | {
      type: "image";
      align: BlockAlign;
      alt: string;
      /** Missing = placeholder at the given aspect ratio until a real asset exists. */
      src?: string;
      aspectRatio?: string;
      caption?: string;
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
            "TODO: What made you want to build this? What was wrong with the Pomodoro timers you'd tried, and why a frog?",
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
            "TODO: Why each of these? e.g. why Firebase instead of your own backend, why Tailwind for this project.",
          ],
        },
        {
          type: "text",
          heading: "Works without an account",
          paragraphs: [
            "Signing in is optional. Timer settings and the chosen background persist in localStorage, so the app is fully usable without Firebase — an account only adds cross-device sync and stats.",
            "TODO: Why you made it work this way, and what it cost to support both paths.",
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
          paragraphs: ["TODO: Where the cozy, pixel-frog look came from — references, early sketches, and what changed."],
        },
        {
          type: "text",
          heading: "Looking back",
          paragraphs: ["TODO: The hardest problem you hit, what you'd do differently, and what's next."],
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
