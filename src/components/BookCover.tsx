import Image from "next/image";

export default function BookCover({ priority = false }: { priority?: boolean }) {
  return (
    <div className="book-cover-stage">
      <Image
        src="/images/book-cover.jpg"
        alt="Pulling the Thread, by Kyler Wakefield — hardcover book"
        width={1264}
        height={843}
        priority={priority}
        className="book-cover-art w-full"
      />
    </div>
  );
}
