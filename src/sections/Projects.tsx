import { ProjectTease } from "../components/ProjectTease";
import { LISTED_PROJECTS } from "../data/projects";
import "./Projects.css";

export default function Projects() {
  return (
    <section id="projects" className="page section projects">
      <h2 className="section-heading projects-heading" data-reveal>
        Projects
      </h2>
      <div className="projects-grid">
        {LISTED_PROJECTS.map((project) => (
          <ProjectTease key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
