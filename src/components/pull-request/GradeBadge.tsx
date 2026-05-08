import type { PullRequestGrade } from '@/features/pull-request/pullRequest.types';
import { PULL_REQUEST_GRADE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/cn';

type GradeBadgeProps = {
  grade: PullRequestGrade;
  compact?: boolean;
};

const gradeClasses: Record<PullRequestGrade, string> = {
  MAJOR: 'border-amber-200 bg-amber-50 text-amber-800',
  NORMAL: 'border-accent-200 bg-accent-50 text-accent-800',
  MINOR: 'border-sky-200 bg-sky-50 text-sky-800',
};

export const GradeBadge = ({ grade, compact = false }: GradeBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-semibold',
        compact ? 'h-6 px-2 text-xs' : 'h-8 px-3 text-sm',
        gradeClasses[grade],
      )}
    >
      {PULL_REQUEST_GRADE_LABELS[grade]}
    </span>
  );
};
