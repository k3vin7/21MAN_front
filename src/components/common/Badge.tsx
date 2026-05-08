import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'default' | 'teal' | 'blue' | 'amber' | 'rose' | 'slate';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  default: 'border-white/10 bg-white/5 text-slate-200',
  teal: 'border-accent-400/20 bg-accent-400/10 text-accent-200',
  blue: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  rose: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  slate: 'border-slate-600/60 bg-slate-800/80 text-slate-300',
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

