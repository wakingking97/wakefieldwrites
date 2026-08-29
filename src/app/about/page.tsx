import Image from "next/image";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About the Author | Kyler Wakefield",
  description:
    "About Kyler Wakefield, author of Pulling the Thread: Perception, Control, and the System Behind Everything.",
  path: "/about",
  image: "/images/author-photo.jpg",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">About</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
        Kyler Wakefield
      </h1>

      <div className="mt-12 grid gap-12 sm:grid-cols-[1fr_1.6fr]">
        <div className="min-w-0">
          <Image
            src="/images/author-photo.jpg"
            alt="Kyler Wakefield"
            width={900}
            height={1202}
            className="w-full rounded-lg border border-line object-cover"
          />
        </div>

        <div className="min-w-0 space-y-6 text-base leading-8 text-muted">
          <p>
            I work weekdays on my family&rsquo;s ranch, and the night shift
            on weekends at a hotel in Santa Rosa, New Mexico. I am two years
            sober.
          </p>
          <p>
            The years leading up to this book were the roughest of my life
            — and almost ended it a few times. Starting around 2020 I began
            struggling with addiction. Cocaine. Fentanyl. Heroin. Meth. What
            started as experimentation did what addiction always does — it
            escalated into something I couldn&rsquo;t control and
            didn&rsquo;t recognize as myself anymore. My morals went out the
            window. My self-esteem followed. I had owned a house at
            twenty-two and was running my own construction company. Within a
            year and a half I was homeless and broke. The person I had been
            went somewhere I couldn&rsquo;t find for a long time.
          </p>
          <p>
            Between January and May of 2024 I overdosed three times. The
            last time I woke up in a hospital. That was the moment. What
            followed was a year moving between rehab facilities — fighting
            for the version of myself that was still in there somewhere. On
            May 8, 2024, I got sober. I have stayed sober since.
          </p>
          <p>
            When I came out the other side the world looked different. Not
            just spiritually — though I did get closer to my God. Everything
            looked different. Truths I couldn&rsquo;t see before became
            visible. Patterns emerged that I couldn&rsquo;t unsee once I saw
            them. The years on the street had given me something no
            classroom teaches — an understanding of how systems work on
            people. How they capture and hold and exhaust the most
            vulnerable. How the gap between what we are told and what is
            real shows up first in the lives of the people who have nothing
            left to protect them from it.
          </p>
          <p>
            In January of 2025 I went back to school. I earned my ASBA
            degree in eleven months, graduating with honors and an
            invitation to the National Society of Leadership and Success.
          </p>
          <p>
            This book started the same year. Not because I had credentials.
            Because I couldn&rsquo;t stop asking questions. Because once you
            see the pattern you can&rsquo;t unsee it. Because I always
            wanted to write something — and somewhere between the hospital
            bed and the hotel front desk I realized that finding the truth
            was never going to be enough. The mission had to be sharing it.
          </p>
          <p>
            I am not a professor. I am not a journalist or a politician or a
            Washington insider. I am a person who almost didn&rsquo;t make
            it — and decided that making it wasn&rsquo;t enough if it
            didn&rsquo;t mean something.
          </p>
          <Image
            src="/images/kyler-signature.png"
            alt=""
            width={640}
            height={150}
            className="h-auto w-48 opacity-90"
          />
        </div>
      </div>
    </div>
  );
}
