'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type Side = 'top' | 'right' | 'bottom' | 'left';

export function TooltipWrapper({
  side = 'right',
  label,
  children,
  leftBorder = false,
  rightBorder = false,
  preventFocus = false,
}: Readonly<{
  side?: Side;
  label: string;
  children: React.ReactNode;
  leftBorder?: boolean;
  rightBorder?: boolean;
  open?: boolean;
  preventFocus?: boolean;
}>) {
  let alignValue: 'start' | 'end' | 'center' = 'center';
  if (leftBorder) alignValue = 'start';
  else if (rightBorder) alignValue = 'end';

  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        onFocus={(e) => {
          if (preventFocus) {
            e.preventDefault();
          }
        }}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} align={alignValue} avoidCollisions>
        <p className="font-semibold pb-0.75">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
