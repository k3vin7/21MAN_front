import { CheckCircle2, LockKeyhole, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
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
  const featuredProposal = merged.find((pullRequest) => pullRequest.finalGrade === 'MAJOR') ?? merged[0];
  const gradeCounts = {
    MAJOR: pullRequests.filter((pullRequest) => pullRequest.finalGrade === 'MAJOR').length,
    NORMAL: pullRequests.filter((pullRequest) => pullRequest.finalGrade === 'NORMAL').length,
    MINOR: pullRequests.filter((pullRequest) => pullRequest.finalGrade === 'MINOR').length,
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <img
          alt=""
          className="h-24 w-28 shrink-0 rounded-lg object-cover"
          src={repository.thumbnail}
        />
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950">{repository.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{repository.description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="amber">핵심 제안 {gradeCounts.MAJOR}</Badge>
        <Badge tone="teal">설정 보강 {gradeCounts.NORMAL}</Badge>
        <Badge tone="blue">작은 제안 {gradeCounts.MINOR}</Badge>
        {privateCount ? (
          <Badge tone="slate">
            <LockKeyhole className="mr-1 size-3" />
            비공개 제안 {privateCount}건
          </Badge>
        ) : null}
      </div>

      {featuredProposal ? (
        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <CheckCircle2 className="size-4 text-slate-700" />
            <span className="text-sm font-semibold text-slate-700">공식 반영된 창작 제안</span>
          </div>
          <h4 className="mt-3 text-sm font-semibold text-slate-950">{featuredProposal.title}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{featuredProposal.structuredContent.expectedEffect}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5" />
              {featuredProposal.timestamps.mergedAt ? formatDate(featuredProposal.timestamps.mergedAt) : '반영 대기'}
            </span>
            <Link className="font-semibold text-slate-700 hover:text-slate-950" to={`/r/${repository.id}/pr/${featuredProposal.id}/review`}>
              제안 보기
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          <Send className="size-4 text-slate-500" />
          아직 공식 반영된 제안이 없습니다.
        </div>
      )}
    </article>
  );
};
