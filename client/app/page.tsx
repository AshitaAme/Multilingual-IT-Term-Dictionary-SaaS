import { TagCardDisplay } from '@/features/dictionary';
import { TypingAnimation } from '@/shared/components/ui/typing-animation';

export default function Home() {
  return (
    <main className="flex flex-col">
      <h1 className="flex pt-[4%] justify-center text-4xl font-bold">
        <TypingAnimation>Hello Word!</TypingAnimation>
      </h1>

      <TagCardDisplay />
    </main>
  );
}
