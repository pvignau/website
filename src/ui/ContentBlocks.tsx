import type { ContentBlock, Link, Project } from '../content';
import { ui } from '../content';
import './ContentBlocks.css';

type HeadingLevel = 2 | 3 | 4;

const EXTERNAL = /^https?:\/\//;

/** Renders structured copy as semantic HTML: text is never injected as markup. */
interface BlockOptions {
  /** Level of the project headings, one below the surrounding title. */
  headingLevel: HeadingLevel;
  /** -1 keeps links out of the Tab order while their text is visually hidden. */
  linkTabIndex?: number;
}

export function ContentBlocks({
  blocks,
  ...options
}: BlockOptions & { blocks: readonly ContentBlock[] }) {
  return blocks.map((block, index) => <Block key={index} block={block} {...options} />);
}

function Block({ block, headingLevel, linkTabIndex }: BlockOptions & { block: ContentBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return <p className="content-paragraph">{block.text}</p>;
    case 'list':
      return (
        <ul className="content-list">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    case 'projects':
      return (
        <ul className="projects">
          {block.items.map((project) => (
            <ProjectCard
              key={project.name}
              project={project}
              headingLevel={headingLevel}
              linkTabIndex={linkTabIndex}
            />
          ))}
        </ul>
      );
  }
}

function ProjectCard({ project, headingLevel, linkTabIndex }: BlockOptions & { project: Project }) {
  const Heading = `h${headingLevel}` as const;
  return (
    <li className="project">
      <Heading className="project__name">{project.name}</Heading>
      <p className="project__summary">{project.summary}</p>
      {project.tags.length > 0 && (
        <ul className="project__tags">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      <LinkList links={project.links} linkTabIndex={linkTabIndex} />
    </li>
  );
}

export function LinkList({
  links,
  linkTabIndex,
}: {
  links: readonly Link[];
  linkTabIndex?: number;
}) {
  if (links.length === 0) return null;
  return (
    <ul className="link-list">
      {links.map((link, index) => (
        <li key={index}>
          <ContentLink link={link} tabIndex={linkTabIndex} />
        </li>
      ))}
    </ul>
  );
}

/** External links open in a new tab, which screen readers announce. */
export function ContentLink({ link, tabIndex }: { link: Link; tabIndex?: number | undefined }) {
  const external = EXTERNAL.test(link.href);
  return (
    <a
      className="content-link"
      href={link.href}
      tabIndex={tabIndex}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {link.label}
      {external && <span className="visually-hidden"> {ui.dialog.newTab}</span>}
    </a>
  );
}
