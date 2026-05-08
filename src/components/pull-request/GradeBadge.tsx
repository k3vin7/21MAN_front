import type { PullRequestGrade } from '@/features/pull-request/pullRequest.types';
import { PULL_REQUEST_GRADE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/cn';

type GradeBadgeProps = {
  grade: PullRequestGrade;
  compact?: boolean;
};

const gradeClasses: Record<PullRequestGrade, string> = {
  MAJOR: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  NORMAL: 'border-accent-300/30 bg-accent-300/10 text-accent-100',
  MINOR: 'border-sky-300/30 bg-sky-300/10 text-sky-200',
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

