// Themed subscribe block. Subscribing happens entirely on Substack's own
// site; this site never receives or stores email addresses.
const SUBSCRIBE_URL = "https://thehumanspeciesproject.substack.com/subscribe";

export default function SubscribeBlock({
  heading = "Get new pieces by email",
}: {
  heading?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">
      <h2 className="font-serif text-xl">{heading}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
        Subscribe to The Human Species Project on Substack. New pieces go
        straight to your inbox.
      </p>
      <a
        href={SUBSCRIBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
      >
        Subscribe free
      </a>
    </div>
  );
}
