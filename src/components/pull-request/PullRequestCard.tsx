import { Eye, LockKeyhole } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { GradeBadge } from '@/components/pull-request/GradeBadge';
import type { PullRequest } from '@/features/pull-request/pullRequest.types';
import type { User } from '@/features/user/user.types';
import { CONFLICT_RISK_LABELS, PULL_REQUEST_STATUS_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/date';
import { cn } from '@/lib/cn';

type PullRequestCardProps = {
  pullRequest: PullRequest;
  author?: User;
  selected?: boolean;
  onClick?: () => void;
};

const riskTone = {
  HIGH: 'rose',
  MEDIUM: 'amber',
  LOW: 'teal',
} as const;

export const PullRequestCard = ({ pullRequest, author, selected = false, onClick }: PullRequestCardProps) => {
  const VisibilityIcon = pullRequest.visibility === 'PRIVATE' ? LockKeyhole : Eye;

  return (
    <button
      className={cn(
        'w-full rounded-lg border p-4 text-left transition',
        selected ? 'border-accent-300/50 bg-accent-300/10' : 'border-white/10 bg-slate-900/70 hover:border-white/20',
      )}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <GradeBadge compact grade={pullRequest.finalGrade} />
        <Badge tone={pullRequest.visibility === 'PRIVATE' ? 'amber' : 'blue'}>
          <VisibilityIcon className="mr-1 size-3" />
          {pullRequest.visibility}
        </Badge>
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-white">{pullRequest.title}</h3>
      <p className="mt-2 text-xs text-slate-500">@{author?.username ?? 'unknown'}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="slate">{PULL_REQUEST_STATUS_LABELS[pullRequest.status]}</Badge>
        <Badge tone={riskTone[pullRequest.structuredContent.conflictRisk]}>
          {CONFLICT_RISK_LABELS[pullRequest.structuredContent.conflictRisk]}
        </Badge>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {formatDateTime(pullRequest.timestamps.submittedAt ?? pullRequest.timestamps.draftStartedAt)}
      </p>
    </button>
  );
};

