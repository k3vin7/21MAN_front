import { Award } from 'lucide-react';
import type { Achievement } from '@/features/user/user.types';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/cn';

type AchievementBadgeProps = {
  achievement: Achievement;
  selected?: boolean;
  onClick?: () => void;
};

const toneClasses: Record<Achievement['tone'], string> = {
  teal: 'border-accent-200 bg-accent-50 text-accent-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  blue: 'border-sky-200 bg-sky-50 text-sky-800',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
};

export const AchievementBadge = ({ achievement, selected = false, onClick }: AchievementBadgeProps) => {
  return (
    <button
      className={cn(
        'rounded-lg border p-4 text-left transition hover:-translate-y-0.5',
        toneClasses[achievement.tone],
        selected && 'ring-2 ring-slate-300',
      )}
      onClick={onClick}
      type="button"
    >
      <Award className="size-5" />
      <h3 className="mt-3 text-sm font-semibold text-slate-950">{achievement.title}</h3>
      <p className="mt-2 text-sm leading-6 opacity-80">{achievement.description}</p>
      <p className="mt-3 text-xs opacity-70">{formatDate(achievement.earnedAt)}</p>
    </button>
  );
};
