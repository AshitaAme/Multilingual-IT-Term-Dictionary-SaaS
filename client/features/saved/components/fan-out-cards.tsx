import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/utils';
import { Astroid, Sparkle, Star } from 'lucide-react';

// Used for loading
export function FanOutCards() {
  const total = 10;
  const cards = new Array(total);

  return (
    <div className="relative h-full w-full">
      <style>{`
        @keyframes fanOutLoop {
          0% { transform: rotate(-45deg); opacity: 0.3; }
          15% {opacity: 1; }
          65% { transform: rotate(var(--target-angle)); opacity: 1; }
          85% { transform: rotate(var(--target-angle)); opacity: 0; }
          100% { transform: rotate(-45deg); opacity: 0; }
        }
        .animate-fan-out {
          animation: fanOutLoop 3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }
      `}</style>
      {[...cards].map((_, index) => {
        const targetAngle =
          index === 0 ? -46 : index * (100 / (total - 1)) - 45;
        return (
          <Card
            key={targetAngle}
            className={cn(
              'w-50 h-65 ring-1 bg-background/70',
              'absolute right-1/2 bottom-1/2 translate-1/2',
              `origin-bottom animate-fan-out`,
              'flex justify-center items-center',
            )}
            style={
              {
                '--target-angle': `${targetAngle}deg`,
                zIndex: index,
              } as React.CSSProperties
            }
          >
            {index === total - 1 && (
              <Star
                size={50}
                strokeWidth={1}
                className="text-yellow-400 fill-yellow-400"
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}
