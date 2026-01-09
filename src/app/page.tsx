import PoemGenerator from "@/components/poem-generator";
import { Feather, BookOpen } from "lucide-react";

const quotes = [
  {
    text: "No matter what anybody tells you, words and ideas can change the world.",
    author: "John Keating, Dead Poets Society",
  },
  {
    text: "We don't read and write poetry because it's cute. We read and write poetry because we are members of the human race. And the human race is filled with passion.",
    author: "John Keating, Dead Poets Society",
  },
  {
    text: "Poetry is when an emotion has found its thought and the thought has found words.",
    author: "Robert Frost",
  },
  {
    text: "A poem begins as a lump in the throat, a sense of wrong, a homesickness, a lovesickness.",
    author: "Robert Frost",
  }
];

export default function Home() {
  // Since this is a server component, this will generate a random quote on each page load.
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center text-center">
          <Feather className="w-10 h-10 md:w-12 md:h-12 mr-4 text-primary" />
          <div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-accent">
              Ode Weaver
            </h1>
            <p className="text-muted-foreground mt-1 font-body">Inspired by Dead Poets Society</p>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl">
        <PoemGenerator />
      </main>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 mt-12 bg-card/50">
        <div className="max-w-3xl mx-auto text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-4 text-primary" />
          <blockquote className="relative">
            <p className="text-lg italic font-body text-foreground/80">
              "{quote.text}"
            </p>
            <cite className="block mt-4 text-sm font-body text-muted-foreground">— {quote.author}</cite>
          </blockquote>
        </div>
      </footer>
    </div>
  );
}
