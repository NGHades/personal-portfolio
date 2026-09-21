import { ImagePlaceholder } from "../components/ImagePlaceholder";
import "./Projects.css";

// TODO: fill in real descriptions, tags, and links for each project.
const PROJECTS = [
  {
    name: "DermCat",
    description: "TODO: one-line description.",
    tags: [] as string[],
    githubUrl: "https://github.com/",
    liveUrl: undefined as string | undefined,
  },
  {
    name: "rag-for-neanderthals",
    description: "TODO: one-line description.",
    tags: [] as string[],
    githubUrl: "https://github.com/",
    liveUrl: undefined as string | undefined,
  },
  {
    name: "Frogodoro",
    description: "TODO: one-line description.",
    tags: [] as string[],
    githubUrl: "https://github.com/",
    liveUrl: undefined as string | undefined,
  },
];

export default function Projects() {
  return (
    <section id="projects" className="page section">
      <h2 className="projects-heading">Projects</h2>
      <div className="projects-grid">
        {PROJECTS.map((project) => (
          <article key={project.name} className="project-card">
            <ImagePlaceholder label={`${project.name} screenshot`} aspectRatio="16 / 10" />
            <h3 className="project-card-title">{project.name}</h3>
            <p className="project-card-description">{project.description}</p>
            {project.tags.length > 0 && (
              <ul className="project-card-tags">
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
            <div className="project-card-links">
              <a href={project.githubUrl} target="_blank" rel="noreferrer">
                GitHub →
              </a>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  Live demo →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
