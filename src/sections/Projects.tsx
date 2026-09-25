import { TeaseMedia } from "../components/TeaseMedia";
import "./Projects.css";

type Project = {
  name: string;
  /** One line, read as "Name: pitch" in the caption. */
  pitch: string;
  tags: string[];
  githubUrl: string;
  liveUrl?: string;
  /** 16:9 screenshots. The second fades in on hover; either can be missing for now. */
  image?: string;
  hoverImage?: string;
};

// First project gets the large tease, so order matters.
// TODO: fill in real pitches, tags, links and screenshots for each project.
const PROJECTS: Project[] = [
  {
    name: "Frogodoro",
    pitch: "A frog-themed Pomodoro timer with lo-fi music, animated scenes, and Firebase-synced stats",
    tags: ["React", "Vite", "Tailwind CSS", "Firebase"],
    githubUrl: "https://github.com/NGHades/frogodoro",
    liveUrl: "https://frogodoro-alpha.vercel.app/",
  },
  {
    name: "DermCat",
    pitch: "TODO: one-line pitch",
    tags: [],
    githubUrl: "https://github.com/",
  },
  {
    name: "rag-for-neanderthals",
    pitch: "TODO: one-line pitch",
    tags: [],
    githubUrl: "https://github.com/",
  },
];

function ProjectTease({ project, large = false }: { project: Project; large?: boolean }) {
  // The whole tease goes to the live demo when there is one; GitHub is then the
  // secondary link. Without a demo, the tease itself points at GitHub instead.
  const primaryUrl = project.liveUrl ?? project.githubUrl;

  return (
    <article className={`tease project-tease${large ? " project-tease--large" : ""}`} data-reveal>
      <a href={primaryUrl} target="_blank" rel="noreferrer" className="project-tease-link">
        <TeaseMedia alt={`${project.name} screenshot`} src={project.image} hoverSrc={project.hoverImage} />
        <h3 className="project-tease-caption">
          {project.name}: <span className="project-tease-pitch">{project.pitch}</span>
        </h3>
      </a>
      {project.tags.length > 0 && <p className="project-tease-tags">{project.tags.join(" · ")}</p>}
      {project.liveUrl && (
        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="project-tease-secondary">
          GitHub →
        </a>
      )}
    </article>
  );
}

export default function Projects() {
  const [featured, ...rest] = PROJECTS;

  return (
    <section id="projects" className="page section projects">
      <h2 className="section-heading projects-heading" data-reveal>
        Projects
      </h2>
      <ProjectTease project={featured} large />
      <div className="projects-grid">
        {rest.map((project) => (
          <ProjectTease key={project.name} project={project} />
        ))}
      </div>
    </section>
  );
}
