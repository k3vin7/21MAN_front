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
  teal: 'border-accent-300/30 bg-accent-300/10 text-accent-100',
  amber: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
  blue: 'border-sky-300/30 bg-sky-300/10 text-sky-100',
  rose: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
};

export const AchievementBadge = ({ achievement, selected = false, onClick }: AchievementBadgeProps) => {
  return (
    <button
      className={cn(
        'rounded-lg border p-4 text-left transition hover:-translate-y-0.5',
        toneClasses[achievement.tone],
        selected && 'ring-2 ring-white/30',
      )}
      onClick={onClick}
      type="button"
    >
      <Award className="size-5" />
      <h3 className="mt-3 text-sm font-semibold text-white">{achievement.title}</h3>
      <p className="mt-2 text-sm leading-6 opacity-80">{achievement.description}</p>
      <p className="mt-3 text-xs opacity-70">{formatDate(achievement.earnedAt)}</p>
    </button>
  );
};

