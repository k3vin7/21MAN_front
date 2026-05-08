import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'default' | 'teal' | 'blue' | 'amber' | 'rose' | 'slate';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  default: 'border-slate-200 bg-slate-50 text-slate-700',
  teal: 'border-accent-200 bg-accent-50 text-accent-800',
  blue: 'border-sky-200 bg-sky-50 text-sky-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  slate: 'border-slate-200 bg-white text-slate-600',
};

export const Badge = ({ className, tone = 'default', ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
};
