// Substack's official subscribe-form embed. The form itself is hosted and
// handled entirely by Substack (this site never sees or stores emails).
// The iframe's inside is Substack's own white card and can't be restyled;
// the wrapper below makes it sit comfortably on the dark theme.
export default function SubstackEmbed({ heading = "Get new pieces by email" }: { heading?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <h2 className="font-serif text-xl">{heading}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
        Subscribe to The Human Species Project on Substack. New pieces go
        straight to your inbox.
      </p>
      <iframe
        src="https://thehumanspeciesproject.substack.com/embed"
        title="Subscribe to The Human Species Project"
        width="480"
        height="320"
        loading="lazy"
        scrolling="no"
        className="mt-5 block h-[320px] w-full max-w-[480px] rounded-md border border-line bg-white"
      />
    </div>
  );
}
