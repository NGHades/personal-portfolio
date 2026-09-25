import { ProjectTease } from "../components/ProjectTease";
import { PROJECTS } from "../data/projects";
import "./Projects.css";

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
          <ProjectTease key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
