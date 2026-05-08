import { GitMerge, GitPullRequest, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { GradeBadge } from '@/components/pull-request/GradeBadge';
import type { PullRequest } from '@/features/pull-request/pullRequest.types';
import type { Repository } from '@/features/repository/repository.types';
import { formatDate } from '@/lib/date';

type ContributionSummaryCardProps = {
  repository: Repository;
  pullRequests: PullRequest[];
};

export const ContributionSummaryCard = ({
  repository,
  pullRequests,
}: ContributionSummaryCardProps) => {
  const publicPullRequests = pullRequests.filter((pullRequest) => pullRequest.visibility === 'PUBLIC');
  const privateCount = pullRequests.length - publicPullRequests.length;
  const merged = publicPullRequests.filter((pullRequest) => pullRequest.status === 'MERGED');
  const majorMerge = merged.find((pullRequest) => pullRequest.finalGrade === 'MAJOR') ?? merged[0];
  const gradeCounts = {
    MAJOR: pullRequests.filter((pullRequest) => pullRequest.finalGrade === 'MAJOR').length,
    NORMAL: pullRequests.filter((pullRequest) => pullRequest.finalGrade === 'NORMAL').length,
    MINOR: pullRequests.filter((pullRequest) => pullRequest.finalGrade === 'MINOR').length,
  };

  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
      <div className="flex gap-4">
        <img
          alt=""
          className="h-24 w-28 shrink-0 rounded-lg object-cover"
          src={repository.thumbnail}
        />
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">{repository.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{repository.description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="amber">Major {gradeCounts.MAJOR}</Badge>
        <Badge tone="teal">Normal {gradeCounts.NORMAL}</Badge>
        <Badge tone="blue">Minor {gradeCounts.MINOR}</Badge>
        {privateCount ? (
          <Badge tone="slate">
            <LockKeyhole className="mr-1 size-3" />
            비공개 기여 {privateCount}건
          </Badge>
        ) : null}
      </div>

      {majorMerge ? (
        <div className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <GradeBadge compact grade={majorMerge.finalGrade} />
            <span className="text-sm text-amber-100">Major Merge preview</span>
          </div>
          <h4 className="mt-3 text-sm font-semibold text-white">{majorMerge.title}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-300">{majorMerge.structuredContent.expectedEffect}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <GitMerge className="size-3.5" />
              {majorMerge.timestamps.mergedAt ? formatDate(majorMerge.timestamps.mergedAt) : 'Merge 대기'}
            </span>
            <Link className="text-accent-200 hover:text-accent-100" to={`/r/${repository.id}/pr/${majorMerge.id}/review`}>
              원본 PR 보기
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
          <GitPullRequest className="size-4 text-accent-300" />
          아직 public Major Merge가 없습니다.
        </div>
      )}
    </article>
  );
};

