import { useEffect } from "react";
import { useParams } from "react-router";
import { ImagePlaceholder } from "../components/ImagePlaceholder";
import { LazyImage } from "../components/LazyImage";
import { ProjectTease } from "../components/ProjectTease";
import { findProject, upNext, type CaseStudyBlock, type Project } from "../data/projects";
import { useScrollReveal } from "../hooks/useScrollReveal";
import NotFoundPage from "./NotFoundPage";
import "./CaseStudyPage.css";

export default function CaseStudyPage() {
  const { slug } = useParams();
  const project = findProject(slug);
  if (!project) return <NotFoundPage />;
  // Keyed so "Up Next" to another case study mounts a fresh page — new reveal pass,
  // new images fading in — the way Upstatement's full page loads behave.
  return <CaseStudy key={project.slug} project={project} />;
}

function CaseStudy({ project }: { project: Project }) {
  const { caseStudy } = project;
  useScrollReveal();

  useEffect(() => {
    const previous = document.title;
    document.title = `${project.name} — Richie Nguyen`;
    return () => {
      document.title = previous;
    };
  }, [project.name]);

  return (
    <article className="case-study">
      <header className="cs-topper">
        <div className="cs-topper-inner">
          <div className="cs-topper-text" data-reveal>
            <h1 className="cs-topper-title">{project.name}</h1>
            <p className="cs-topper-description">{project.pitch}</p>
            <p className="cs-topper-introduction">{caseStudy.introduction}</p>
            <div className="cs-topper-cols">
              {caseStudy.columns.map((col) => (
                <div key={col.header} className="cs-topper-col">
                  <h2 className="cs-topper-col-header">{col.header}</h2>
                  <ul className="cs-topper-col-list">
                    {col.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="cs-topper-links">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  Visit the site <span aria-hidden="true">↗</span>
                </a>
              )}
              <a href={project.githubUrl} target="_blank" rel="noreferrer">
                View on GitHub <span aria-hidden="true">↗</span>
              </a>
            </p>
          </div>
          <figure className="cs-topper-asset" data-reveal>
            <Frame src={caseStudy.heroImage} alt={caseStudy.heroAlt} aspectRatio="4 / 3" />
          </figure>
        </div>
      </header>

      <div className="cs-blocks">
        {caseStudy.blocks.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>

      <section className="cs-recirc" data-reveal aria-labelledby="cs-recirc-header">
        <h2 className="cs-recirc-header" id="cs-recirc-header">
          Up Next:
        </h2>
        <div className="cs-recirc-grid">
          {upNext(project.slug).map((next) => (
            <ProjectTease key={next.slug} project={next} showTags={false} />
          ))}
        </div>
      </section>
    </article>
  );
}

function Block({ block }: { block: CaseStudyBlock }) {
  if (block.type === "text") {
    return (
      <div className="cs-block cs-block--text" data-reveal>
        {block.heading && <h2 className="cs-block-heading">{block.heading}</h2>}
        {block.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {block.list && (
          <ul className="cs-block-list">
            {block.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <figure className={`cs-block cs-block--image cs-align-${block.align}`} data-reveal>
      <Frame src={block.src} alt={block.alt} aspectRatio={block.aspectRatio} />
      {block.caption && <figcaption className="cs-block-caption">{block.caption}</figcaption>}
    </figure>
  );
}

/** An image's frame: a placeholder until there's a real asset, then the image fading in. */
function Frame({ src, alt, aspectRatio }: { src?: string; alt: string; aspectRatio?: string }) {
  if (!src) return <ImagePlaceholder label={alt} aspectRatio={aspectRatio ?? "16 / 9"} className="cs-frame" />;

  // Without an aspect ratio the image keeps its natural shape instead of being cropped.
  return (
    <div className={`cs-frame${aspectRatio ? " cs-frame--cropped" : ""}`} style={{ aspectRatio }}>
      <LazyImage src={src} alt={alt} />
    </div>
  );
}
