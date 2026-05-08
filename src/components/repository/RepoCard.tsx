import { GitMerge, GitPullRequest, Timer, Users } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import type { Repository } from '@/features/repository/repository.types';
import type { User } from '@/features/user/user.types';
import {
  RECRUITING_AREA_LABELS,
  REPOSITORY_BADGE_LABELS,
  WORK_SCALE_LABELS,
} from '@/lib/constants';
import { formatPercent, formatReviewDays, truncateText } from '@/lib/format';

type RepoCardProps = {
  repository: Repository;
  author?: User;
  onClick: (repository: Repository) => void;
};

export const RepoCard = ({ repository, author, onClick }: RepoCardProps) => {
  const activeAreas = repository.readme.recruitingAreas.filter(
    (area) => area.status === 'ACTIVELY_RECRUITING',
  );

  return (
    <button
      className="group relative min-h-[320px] overflow-hidden rounded-lg border border-white/10 bg-slate-900 text-left shadow-soft transition hover:-translate-y-1 hover:border-accent-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
      onClick={() => onClick(repository)}
      type="button"
    >
      <img
        alt=""
        className="absolute inset-0 size-full object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-40"
        src={repository.thumbnail}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/10" />

      <div className="relative flex h-full min-h-[320px] flex-col justify-end p-5">
        <div className="flex flex-wrap gap-2">
          {repository.badges.slice(0, 2).map((badge) => (
            <Badge key={badge} tone={badge === 'NEW' ? 'amber' : 'teal'}>
              {REPOSITORY_BADGE_LABELS[badge]}
            </Badge>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-accent-200">{repository.genre} · {WORK_SCALE_LABELS[repository.workScale]}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{repository.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{truncateText(repository.description, 88)}</p>
        </div>

        <div className="mt-5 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <div className="rounded-lg border border-white/10 bg-slate-950/75 p-4 backdrop-blur">
            <p className="text-sm text-slate-300">
              by <span className="font-semibold text-white">@{author?.username ?? 'unknown'}</span>
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <GitPullRequest className="size-4 text-accent-300" />
                PR {repository.stats.prCount}
              </span>
              <span className="flex items-center gap-2">
                <GitMerge className="size-4 text-accent-300" />
                Merge {repository.stats.mergeCount}
              </span>
              <span className="flex items-center gap-2">
                <Users className="size-4 text-accent-300" />
                {formatPercent(repository.stats.mergeRate)}
              </span>
              <span className="flex items-center gap-2">
                <Timer className="size-4 text-accent-300" />
                {formatReviewDays(repository.stats.avgReviewDays)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {activeAreas.slice(0, 3).map((area) => (
                <Badge key={area.id} tone="blue">
                  {RECRUITING_AREA_LABELS[area.type]}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

