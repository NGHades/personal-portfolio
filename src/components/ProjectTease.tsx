import { Link } from "react-router";
import type { Project } from "../data/projects";
import { TeaseMedia } from "./TeaseMedia";
import "./ProjectTease.css";

type ProjectTeaseProps = {
  project: Project;
  /** Tech tags under the caption. On for the home grid, off in "Up Next" where they're noise. */
  showTags?: boolean;
};

/** Screenshot + "Name: pitch" caption. The whole tease opens the project's case study. */
export function ProjectTease({ project, showTags = true }: ProjectTeaseProps) {
  return (
    <article className="tease project-tease" data-reveal>
      <Link to={`/projects/${project.slug}`} className="project-tease-link">
        <TeaseMedia alt={`${project.name} screenshot`} src={project.image} hoverSrc={project.hoverImage} />
        <h3 className="project-tease-caption">
          {project.name}: <span className="project-tease-pitch">{project.pitch}</span>
        </h3>
      </Link>
      {showTags && project.tags.length > 0 && <p className="project-tease-tags">{project.tags.join(" · ")}</p>}
    </article>
  );
}
