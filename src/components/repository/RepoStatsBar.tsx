import { CalendarDays, GitMerge, GitPullRequest, Percent, Timer, Users } from 'lucide-react';
import type { Repository } from '@/features/repository/repository.types';
import { formatDate } from '@/lib/date';
import { formatNumber, formatPercent, formatReviewDays } from '@/lib/format';

type RepoStatsBarProps = {
  repository: Repository;
};

export const RepoStatsBar = ({ repository }: RepoStatsBarProps) => {
  const stats = [
    {
      label: 'PR',
      value: formatNumber(repository.stats.prCount),
      icon: GitPullRequest,
    },
    {
      label: 'Merge',
      value: formatNumber(repository.stats.mergeCount),
      icon: GitMerge,
    },
    {
      label: 'Merge rate',
      value: formatPercent(repository.stats.mergeRate),
      icon: Percent,
    },
    {
      label: 'Avg review',
      value: formatReviewDays(repository.stats.avgReviewDays),
      icon: Timer,
    },
    {
      label: 'Contributors',
      value: formatNumber(repository.stats.contributorCount),
      icon: Users,
    },
    {
      label: 'Last activity',
      value: formatDate(repository.stats.lastActivity),
      icon: CalendarDays,
    },
  ];

  return (
    <dl className="grid overflow-hidden rounded-lg border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.label} className="border-b border-r border-slate-200 p-4 last:border-r-0 sm:last:border-b-0 xl:border-b-0">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Icon className="size-4 text-accent-600" />
              {item.label}
            </dt>
            <dd className="mt-2 text-lg font-semibold text-slate-950">{item.value}</dd>
          </div>
        );
      })}
    </dl>
  );
};
