import { Eye, GitPullRequest, LockKeyhole, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { GradeBadge } from '@/components/pull-request/GradeBadge';
import type { PullRequest } from '@/features/pull-request/pullRequest.types';
import type { User } from '@/features/user/user.types';
import {
  CONFLICT_RISK_LABELS,
  PULL_REQUEST_STATUS_LABELS,
  VISIBILITY_LABELS,
} from '@/lib/constants';
import { formatDateTime } from '@/lib/date';
import { truncateText } from '@/lib/format';

type PullRequestListItemProps = {
  pullRequest: PullRequest;
  author?: User;
};

const riskTone = {
  HIGH: 'rose',
  MEDIUM: 'amber',
  LOW: 'teal',
} as const;

export const PullRequestListItem = ({ pullRequest, author }: PullRequestListItemProps) => {
  const submittedAt = pullRequest.timestamps.submittedAt ?? pullRequest.timestamps.draftStartedAt;
  const VisibilityIcon = pullRequest.visibility === 'PRIVATE' ? LockKeyhole : Eye;

  return (
    <Link
      className="block rounded-lg border border-white/10 bg-slate-900/70 p-4 transition hover:border-accent-300/30 hover:bg-slate-900"
      to={`/r/${pullRequest.repositoryId}/pr/${pullRequest.id}/review`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <GradeBadge compact grade={pullRequest.finalGrade} />
            <Badge tone="slate">{PULL_REQUEST_STATUS_LABELS[pullRequest.status]}</Badge>
            <Badge tone={pullRequest.visibility === 'PUBLIC' ? 'blue' : 'amber'}>
              <VisibilityIcon className="mr-1 size-3" />
              {VISIBILITY_LABELS[pullRequest.visibility]}
            </Badge>
          </div>

          <h3 className="mt-3 text-base font-semibold text-white">{pullRequest.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {truncateText(pullRequest.structuredContent.expectedEffect, 120)}
          </p>
        </div>

        <div className="shrink-0 text-left lg:text-right">
          <p className="text-sm text-slate-300">@{author?.username ?? 'unknown'}</p>
          <p className="mt-1 text-xs text-slate-500">{formatDateTime(submittedAt)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="default">
          <GitPullRequest className="mr-1 size-3" />
          AI {pullRequest.aiGrading.totalScore}/100
        </Badge>
        <Badge tone={riskTone[pullRequest.structuredContent.conflictRisk]}>
          <ShieldAlert className="mr-1 size-3" />
          충돌 {CONFLICT_RISK_LABELS[pullRequest.structuredContent.conflictRisk]}
        </Badge>
        {pullRequest.contributionTypes.slice(0, 3).map((type) => (
          <Badge key={type} tone="blue">
            {type}
          </Badge>
        ))}
      </div>
    </Link>
  );
};

