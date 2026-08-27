"use client";

import { forwardRef } from "react";
import dynamic from "next/dynamic";
import { SAMPLE_PAGES, type SamplePage } from "./sampleContent";

// react-pageflip touches the DOM at render time, so it can't be
// server-rendered -- load it client-only to avoid a hydration mismatch.
const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

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
        {page.subheading && (
          <p className="sample-page__subheading">{page.subheading}</p>
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
          <ol className="sample-page__list">
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

export default function FlipbookViewer() {
  return (
    <div className="sample-flipbook-wrap">
      <HTMLFlipBook
        width={350}
        height={500}
        size="stretch"
        minWidth={280}
        maxWidth={500}
        minHeight={400}
        maxHeight={700}
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
      >
        <CoverPage />
        {SAMPLE_PAGES.map((page, i) => (
          <ContentPage key={i} page={page} number={i + 1} />
        ))}
        <EndPage />
      </HTMLFlipBook>
    </div>
  );
}
