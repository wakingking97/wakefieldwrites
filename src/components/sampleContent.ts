export type Emphasis = "normal" | "italic" | "bold" | "bold-italic";

export type Paragraph = {
  text: string;
  emphasis?: Emphasis;
};

export type ArchitectureItem = {
  label: string;
  text: string;
};

export type SamplePage = {
  eyebrow?: string;
  heading?: string;
  paragraphs?: Paragraph[];
  list?: ArchitectureItem[];
  listStart?: number; // continues numbering when a list spans pages
};

// Verbatim front-matter text from Pulling the Thread, sourced from
// sample-content.md (Kyler-provided excerpt of the manuscript's front
// matter through the opening of Part One). Do not paraphrase or shorten.
// Pages are sized to fit without scrolling on a phone-width page. Only
// the page where a section actually begins carries its eyebrow/heading --
// continuation pages are headerless, the way a real book doesn't
// reprint the chapter title on every page.
export const SAMPLE_PAGES: SamplePage[] = [
  {
    eyebrow: "About This Book",
    heading: "What This Book Is",
    paragraphs: [
      {
        text: "Pulling the Thread is written for anyone willing to listen. A professor and a ranch hand should both be able to pick it up and be unable to put it down — not because it talks down to one or over the head of the other, but because truth and emotional honesty hit every human being the same way when they're delivered clearly enough.",
      },
      {
        text: "The world has become desensitized. Deliberately. The same system this book documents — managed perception and controlled belief — has also managed and controlled human feeling itself. A population that can still feel moral outrage and sustain it is the single most dangerous thing to a system built on manufactured division. So the system learned to exhaust that capacity. This book's job is to cut through that numbness.",
      },
    ],
  },
  {
    eyebrow: "About This Book",
    heading: "The Standard",
    paragraphs: [
      {
        text: "Clear and True. Above everything else. Every claim sourced. Every pattern documented. Written in plain language that respects the intelligence of every reader regardless of background.",
      },
    ],
  },
  {
    eyebrow: "About This Book",
    heading: "The Method",
    paragraphs: [
      {
        text: "This book builds a picture. It does not tell you what to see in it.",
      },
      {
        text: "Politicians tell people what to see, what to think, and what to hear. This book does the opposite. Every chapter lays out documented evidence, verified sources, and honest questions. Then it steps back. What you conclude from what you read belongs to you — not to the author. A conclusion you reach yourself cannot be taken from you. Nobody can call it propaganda. Nobody can call it manipulation. Because this book never tells you what it means. It shows you what's there and asks the questions.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "That is the methodology. Build the picture clearly enough that the reader can see it for themselves. Ask the questions out loud. Follow them to their logical end. And decide what you're looking at.",
      },
      {
        text: "This book is also being written live — during active conflicts, during live Senate debates, during real conversations with real people between a hotel front desk and family ranch in Santa Rosa, New Mexico. The history in these pages exists not to be academic but to show that what is happening right now, has happened before. The pattern is not new. Only the names have changed.",
      },
    ],
  },
  {
    eyebrow: "About This Book",
    heading: "The Structure",
    paragraphs: [
      {
        text: "This book is built to mirror the system it documents. Not just in its words — in its structure. The reader moves through this book the same way they moved through the system itself. It begins on a global scale where the pattern is clearest and hardest to deny. Then it moves closer to home where the same pattern operates but is harder to see because you are living inside it. Then it explains why you couldn't see it. Then it gives you the tools to act on what you now see. The reader experiences the book the way they experienced the system — disoriented at first, then recognizing patterns, then arriving at clarity, then deciding what to do with it.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "Chapter 11, Claiming The Architecture of Power and Control, mirrors The Architecture itself. The system used five tools against you: Education, Finance, Media, Law, and Religion. Chapter 11 returns five tools to you: your attention, your money, your identity, your voice, and your community. The same structure. Pointed in a different direction. The reader who sees that will feel it like a key turning in a lock.",
      },
      {
        text: "The patterns are in the words. The patterns are in the structure. The patterns are everywhere — once you know how to look. That is the point of this book. And it starts on the next page.",
      },
    ],
  },
  {
    eyebrow: "About This Book",
    heading: "The Architecture of Power and Control",
    paragraphs: [
      {
        text: "Every chapter in this book documents the same architecture operating across different eras, different scales, and different contexts. This architecture has many tools — more than any single book could fully document. But five appear consistently across every empire, every ruling class, every system of organized power in recorded history. These are the five tools this book focuses on. Not because they are the only tools. Because they are the most documented, the most consistently used, and the most relevant to understanding the world you live in right now. Once you can see them clearly you will recognize them everywhere — you will also start noticing the others on your own.",
      },
    ],
  },
  {
    list: [
      {
        label: "EDUCATION",
        text: "Manufacturing identity, loyalty, and limitations. Teaching people what to think, not how to think. Producing workers and subjects, not free thinkers.",
      },
      {
        label: "FINANCE",
        text: "Controlling the money supply controls governments and populations without a single soldier. The most invisible and most powerful system of control ever developed.",
      },
      {
        label: "RELIGION",
        text: "Manufactured consent, justified hierarchy, managed belief. Not an attack on faith — a documented historical argument about how organized religion has been used by ruling classes to manage populations.",
      },
    ],
  },
  {
    listStart: 4,
    list: [
      {
        label: "MEDIA AND INFORMATION",
        text: "Controlling what people know and how they see the world. From the printing press to Hollywood to the news cycle. The ancestor of every perception management system documented in this book.",
      },
      {
        label: "LAW",
        text: "Writing rules in language that protects the people who wrote them. Complexity as a weapon. Access to justice determined by access to resources.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "Chapter 2 introduces all five tools of The Architecture historically. Every chapter that follows shows The Architecture operating in a different context. The reader who finishes this book will never look at education, finance, religion, media, or law the same way again.",
      },
      {
        text: "These five tools appear consistently across every empire, every ruling class, every system of organized power in recorded history. Not because the people who built them copied each other. Because concentrated power always reaches for the same mechanisms. The pattern is not political. It is natural. It operates in every force — in physics, in ecosystems, in theology, in the weather, in the daily life of every human being on earth. The architecture documented in this book is the human version of something much older than humanity.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "The Truth Behind Power is a parallel research document — six completed chapters covering the birth of administrative power, financial systems, the American Century, and the cracks in the modern order. It is not a second book being written simultaneously. It is the research archive this book draws from for historical depth.",
      },
    ],
  },
  {
    eyebrow: "Dedication",
    paragraphs: [
      {
        text: "For the people who lost their lives to the theater of politics.",
        emphasis: "italic",
      },
      {
        text: "For the people who died pointlessly across the long arc of human history while the people who sent them to their deaths never faced the same consequence.",
        emphasis: "italic",
      },
      {
        text: "For the people who will lose their lives to the choices of leaders they never elected, serving interests they never knew existed.",
        emphasis: "italic",
      },
      {
        text: "For the people whose lives have been changed — quietly, permanently, without their consent — by decisions made in rooms they were never invited into.",
        emphasis: "italic",
      },
      {
        text: "This book is for you.",
        emphasis: "bold",
      },
      {
        text: "You deserved better. You still do.",
        emphasis: "italic",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "For the ones who will close this book before they open it.",
        emphasis: "italic",
      },
      {
        text: "For the ones who checked the publisher before they read the argument.",
        emphasis: "italic",
      },
      {
        text: "For the ones who called it conspiracy before they read a source.",
        emphasis: "italic",
      },
      {
        text: "For the ones who looked for the credentials before they looked at the evidence.",
        emphasis: "italic",
      },
      {
        text: "The dismissal was anticipated, documented, and has already been dismissed.",
        emphasis: "bold",
      },
    ],
  },
  {
    eyebrow: "Epigraph",
    paragraphs: [
      {
        text: "The most powerful forces in history are the ones no one notices until they fail.",
        emphasis: "bold-italic",
      },
      {
        text: "If you want to understand power, don't study the spotlight. Study the shadow it creates.",
        emphasis: "bold-italic",
      },
      {
        text: "Power hides.",
        emphasis: "italic",
      },
      {
        text: "Power adapts.",
        emphasis: "italic",
      },
      {
        text: "Power moves.",
        emphasis: "italic",
      },
      {
        text: "But rarely does power sit on the throne — it stands behind it.",
        emphasis: "italic",
      },
    ],
  },
  {
    eyebrow: "The Thesis",
    heading: "In Plain Language",
    paragraphs: [
      {
        text: "The system being used on you at home has been used across the world for thousands of years.",
      },
      {
        text: "What you believe about your country, your freedom, your choices — much of it was handed to you deliberately.",
      },
      {
        text: "This is not about conspiracy. Conspiracies require secrecy. This system operates openly. It works not because it is hidden, but because it controls what you perceive as real — and perception is total control.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "You don't need to control people. You only need to control what they see, what they focus on, who they think the enemy is, what solutions they think exist, what they believe they deserve — and what they are still capable of feeling.",
      },
      {
        text: "This book makes the invisible visible. Not so you'll follow the author. So, you can see for yourself.",
      },
    ],
  },
  {
    eyebrow: "Introduction",
    heading: "I Couldn't Unsee It",
    paragraphs: [
      {
        text: "What I saw looked a lot like Denver. Or Minneapolis. Or Dallas. A normal city. Built like something we would see right here at home. That's not what I expected. I expected what you see in every movie about the Middle East — small sand towns, ruins, that third world image of a country behind in every way. Primitive. Forgotten. That's what decades of film and news coverage had built inside my head without me ever needing to question it or thinking to question it.",
      },
      {
        text: "And when I realized the reality looked nothing like what I had been shown my entire life, I went straight to my notes. My think space. And I started dissecting everything.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "The first thing I did was ask a question I'd never thought to ask before. Is this really what Iran looks like? Is this what these places really are? It sounds almost embarrassing to admit — that I had to ask. But that's the point. I never needed to ask. The picture had been so consistent, across so many films and so many news cycles, for so many years, that the question had never had a reason to form.",
      },
      {
        text: "What I found wasn't a conspiracy theory. It was documented public record. The CIA had editorial rights to major films. Not influence. Not suggestions. Editorial rights — the ability to review scripts, request changes, and sign off on how America and its enemies were portrayed before a single frame was ever shot. The same government that was making foreign policy decisions about these countries was also deciding how you saw those countries on a Friday night at the movies. And it had been doing this for decades.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: 'It wasn\'t even hidden. In 1943 the precursor to the CIA circulated an internal government memo describing cinema as "one of the most powerful propaganda weapons at the disposal of the United States." The Director of the Office of War Information stated openly that the easiest way to plant an idea in people\'s minds is through an entertainment picture — "when they do not realize they are being propagandized." They wrote it down. They said it out loud to each other. The only people who weren\'t told were the ones sitting in the theater.',
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "And it wasn't just Americans sitting in those theaters. Top Gun didn't stay inside U.S. borders. Neither did Black Hawk Down. Neither did Zero Dark Thirty. Hollywood exports American culture to every corner of the world — and with it, American government-approved narratives about who the enemies are, what those countries look like, and why the wars are necessary. What started as a domestic perception management system became a global one. The entire world was being shown the same carefully shaped picture.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "What I found when I started pulling that thread didn't stop at Hollywood. It never does. The same system that controlled what you saw on the screen also shapes what you read in the news, what you are taught in school, what you are trained to feel — and crucially, what you are trained to stop feeling. It operates through financial systems that discipline entire governments. Through media cycles designed to exhaust your attention before it can become action. Through political division engineered to keep you fighting the person next to you instead of examining the system above you. Through an education that teaches you the symbols of democracy while leaving out the documented evidence of how policy gets made. And through careful management of what stories get told, how far they go, and who — if anyone — is ever held accountable for them.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "These are not separate problems. They are one system. Not a conspiracy — conspiracies require secrecy and active coordination. This is something older and more durable than that. It is something unnatural that has been running long enough and consistently enough that it has developed the self-sustaining properties of a natural system. It no longer needs a hand on the wheel. The incentives are baked in. The behavior reproduces itself without anyone directing it — the way a river doesn't need to be told to flow downhill. That is what makes it so difficult to see and so difficult to stop. And it is older than America. It has been used on every population in every era of recorded history. The names change. The tools evolve. The architecture stays the same. And the further you pull the thread, the more of the architecture you find.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "This book walks through that architecture. Not to make you angry. Not to tell you what to think. But to walk you down the same path I had to walk myself — so that by the end, you can see it clearly enough to name it. And once you can name it, it loses the power it only ever had because you couldn't see it.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "I am not a professor. I am not a journalist or a politician or a Washington insider. This journey started this year. I began asking questions I had never thought to ask — about power, about how the world came to work the way it does, and about why it stays that way. The more I asked, the more I found. And somewhere along the way I realized that finding the truth wasn't enough. That the mission had to be sharing it. The footage of Tehran was the moment that made that mission impossible to ignore. This book is what happens when ordinary people start asking questions the system never intended them to ask. I am not going to tell you what to think. I am not going to tell you what to believe. But I will promise you this — by the time you finish this book, you will not walk through the world the same way you did when you started.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "And underneath all of it — underneath the coups and the media cycles and the tax code and the tribal identities the system built for you — is the thing none of it ever managed to destroy. Before you are American or Russian, Democrat or Republican, rich or poor — you are human. That is the oldest truth there is. And it is the one truth the system has always needed you to forget.",
      },
    ],
  },
  {
    eyebrow: "Before You Turn This Page",
    paragraphs: [
      { text: "What you just read was the door.", emphasis: "italic" },
      { text: "What comes next is the house.", emphasis: "italic" },
      {
        text: "Some people will move through these chapters quickly. Others will need to stop. To sit with something. To put the book down and stare out a window for a while before picking it back up. Both of those are the right way to read this.",
        emphasis: "italic",
      },
      {
        text: "There is no rush here. The truth has been waiting a long time already. It can wait a few more minutes while you catch your breath.",
        emphasis: "italic",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "What follows is documented. Sourced. Verifiable. It is not designed to frighten you or overwhelm you. But it may do both of those things anyway — not because the information is presented that way, but because the gap between what we have been told and what is actually true carries a weight that honest people feel.",
        emphasis: "italic",
      },
      {
        text: "If you feel that weight beginning — that's not weakness. That's your instincts working exactly the way they were designed to.",
        emphasis: "italic",
      },
      {
        text: "Take a moment. Breathe. And when you're ready — turn the page.",
        emphasis: "italic",
      },
    ],
  },
  {
    eyebrow: "Part One",
    heading: "The View From 30,000 Feet",
    paragraphs: [
      {
        text: "Most of us grew up believing the world was complicated in ways that were beyond us. That the wars, the poverty, the inequality, the division — these were just the unfortunate byproducts of a messy world that nobody fully controlled. That the people in charge were doing their best with imperfect information. That if things weren't fair, it was because fairness is hard — not because someone decided it should be this way.",
      },
      {
        text: "I believed that too. Until I started asking why.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "What follows begins far from home. It begins at a global scale — with empires, intelligence agencies, foreign policy decisions made in rooms most people will never see. Not because those things are more important than your daily life. But because distance strips away the noise. When you're looking at a country you've never lived in, a war you've never fought in, a government you've never voted for — you can see the machinery without the interference of personal identity. You can look at what actually happened, who actually decided it, and who actually paid for it. Clearly. Without the fog of partisan loyalty or national pride telling you what you're allowed to conclude.",
      },
    ],
  },
  {
    paragraphs: [
      {
        text: "And once you can see it clearly from that distance — once the architecture of power becomes undeniable at global scale — something shifts. Because you start recognizing the same shapes closer to home. The same mechanisms. The same patterns. The same results. Just smaller. Just quieter. Just dressed in more familiar language.",
      },
      {
        text: "The scale changes. The system does not.",
      },
      {
        text: "That's where we begin.",
      },
    ],
  },
];
