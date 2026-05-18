import { Card } from '@/components/ui/card';
import { TypingAnimation } from '@/components/ui/typing-animation';
// import CardsDisplay from './_components/cards-display';

export const metadata = {
  title: 'Leaves Dictionary',
};

export default function Home() {
  return (
    <main className="flex flex-col gap-4">
      <h1 className="flex pt-[0%] pr-[0%] justify-center text-4xl font-bold">

      <TypingAnimation>
        Hello Word!
      </TypingAnimation>
      </h1>
      <Card className="shadow-md w-60 h-80 ring-0 rounded-none p-0" />
      
      {/* <CardsDisplay /> */}
    </main>
  );
}
