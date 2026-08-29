import type { OtherProject } from "@/lib/otherProjects";

export default function OtherProjectCard({ project }: { project: OtherProject }) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent"
    >
      <h3 className="font-serif text-xl">{project.name}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{project.description}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.15em] text-accent">
        Visit site &rarr;
      </p>
    </a>
  );
}
