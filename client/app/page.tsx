import { TypingAnimation } from '@/components/ui/typing-animation';
import CardsDisplay from './_components/cards-display';

export const metadata = {
  title: 'Leaves Dictionary',
};

export default function Home() {
  return (
    <main className="flex flex-col">
      <h1 className="flex pt-[4%] justify-center text-4xl font-bold">

      <TypingAnimation>
        Hello Word!
      </TypingAnimation>
      </h1>
      
      <CardsDisplay />
    </main>
  );
}
