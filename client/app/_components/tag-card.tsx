import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TagCard({
  tagName,
  tagDescription,
}: Readonly<{ tagName: string; tagDescription: string }>) {
  // TODO: const wordCount = getWordCountByName(tagName);

  return (
    <Card className="w-50 h-80 relative">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <img
        src="https://avatar.vercel.sh/shadcn1"
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">{/* Number for words */}</Badge>
        </CardAction>
        <CardTitle>{tagName}</CardTitle>
        <CardDescription>
          A practical talk on component APIs, accessibility, and shipping
          faster.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">{tagDescription}</Button>
      </CardFooter>
    </Card>
  );
}
