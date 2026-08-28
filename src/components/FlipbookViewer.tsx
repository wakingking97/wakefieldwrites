"use client";

import { forwardRef, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SAMPLE_PAGES, type SamplePage } from "./sampleContent";

// react-pageflip touches the DOM at render time, so it can't be
// server-rendered -- load it client-only to avoid a hydration mismatch.
// It also code-splits into its own JS chunk; without a loading fallback
// and a reserved min-height on its wrapper, the page looks mostly blank
// for however long that chunk takes to fetch and parse.
const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="sample-flipbook-loading">Loading the sample&hellip;</div>
  ),
});

const CoverPage = forwardRef<HTMLDivElement>(function CoverPage(_props, ref) {
  return (
    <div ref={ref} className="sample-page sample-page--cover">
      <p className="sample-page__eyebrow">Read a Sample</p>
      <h1 className="sample-page__cover-title">Pulling the Thread</h1>
      <p className="sample-page__cover-subtitle">
        Perception, Control, and the System Behind Everything
      </p>
      <p className="sample-page__cover-author">Kyler Wakefield</p>
    </div>
  );
});

const EndPage = forwardRef<HTMLDivElement>(function EndPage(_props, ref) {
  return (
    <div ref={ref} className="sample-page sample-page--cover">
      <p className="sample-page__eyebrow">End of Sample</p>
      <p className="sample-page__cover-subtitle sample-page__cover-subtitle--spaced">
        The rest of Part One — and everything after it — continues in the
        full book.
      </p>
    </div>
  );
});

const ContentPage = forwardRef<
  HTMLDivElement,
  { page: SamplePage; number: number }
>(function ContentPage({ page, number }, ref) {
  return (
    <div ref={ref} className="sample-page">
      <div className="sample-page__inner">
        {page.eyebrow && (
          <p className="sample-page__eyebrow">{page.eyebrow}</p>
        )}
        {page.heading && (
          <h2 className="sample-page__heading">{page.heading}</h2>
        )}
        {page.paragraphs?.map((p, i) => (
          <p
            key={i}
            className={
              "sample-page__paragraph" +
              (p.emphasis === "italic" ? " sample-page__paragraph--italic" : "") +
              (p.emphasis === "bold" ? " sample-page__paragraph--bold" : "") +
              (p.emphasis === "bold-italic"
                ? " sample-page__paragraph--italic sample-page__paragraph--bold"
                : "")
            }
          >
            {p.text}
          </p>
        ))}
        {page.list && (
          <ol className="sample-page__list" start={page.listStart ?? 1}>
            {page.list.map((item, i) => (
              <li key={i}>
                <span className="sample-page__list-label">{item.label}</span>
                {" — "}
                {item.text}
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="sample-page__number">{number}</div>
    </div>
  );
});

const TOTAL_PAGES = SAMPLE_PAGES.length + 2; // cover + content pages + end page

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  const d = direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="sample-flip-btn__icon">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FlipbookViewer() {
  // react-pageflip's ref exposes `.pageFlip()`, returning the underlying
  // PageFlip instance (flipNext/flipPrev/etc.) -- its type doesn't infer
  // cleanly through next/dynamic, hence `any` here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <div>
      <div className="sample-flipbook-wrap">
        <HTMLFlipBook
          ref={bookRef}
          width={350}
          height={475}
          size="stretch"
          minWidth={280}
          maxWidth={400}
          minHeight={380}
          maxHeight={670}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          usePortrait={true}
          drawShadow={true}
          flippingTime={700}
          startPage={0}
          startZIndex={0}
          autoSize={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
          className="sample-flipbook"
          style={{}}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onFlip={(e: any) => setPageIndex(e.data)}
        >
          <CoverPage />
          {SAMPLE_PAGES.map((page, i) => (
            <ContentPage key={i} page={page} number={i + 1} />
          ))}
          <EndPage />
        </HTMLFlipBook>
      </div>

      <div className="sample-flip-controls">
        <button
          type="button"
          aria-label="Previous page"
          className="sample-flip-btn"
          disabled={pageIndex <= 0}
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
        >
          <ChevronIcon direction="left" />
        </button>
        <p className="sample-flip-controls__hint">
          Swipe, or tap the arrows to turn the page
        </p>
        <button
          type="button"
          aria-label="Next page"
          className="sample-flip-btn"
          disabled={pageIndex >= TOTAL_PAGES - 1}
          onClick={() => bookRef.current?.pageFlip()?.flipNext()}
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
    </div>
  );
}
