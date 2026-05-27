import { TypingAnimation } from '@/shared/components/ui/typing-animation';
import CardsDisplay from '../features/tags/components/cards-display';

export const metadata = {
  title: 'Leaf Dictionary',
};

export default function Home() {
  return (
    <main className="flex flex-col">
      <h1 className="flex pt-[4%] justify-center text-4xl font-bold">
        <TypingAnimation>Hello Word!</TypingAnimation>
      </h1>

      <CardsDisplay />
    </main>
  );
}
