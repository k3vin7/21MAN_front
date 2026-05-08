import { useState } from 'react';
import { BarChart3, LinkIcon } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Tabs, type TabItem } from '@/components/common/Tabs';
import { ContributorBadge } from '@/components/contributor/ContributorBadge';
import { GradeBadge } from '@/components/pull-request/GradeBadge';
import { PullRequestListItem } from '@/components/pull-request/PullRequestListItem';
import { RepositoryReadme } from '@/components/repository/RepositoryReadme';
import type { MergeHistoryEntry, PullRequest, PullRequestStatus } from '@/features/pull-request/pullRequest.types';
import type { Repository } from '@/features/repository/repository.types';
import type { User } from '@/features/user/user.types';
import { MOCK_CURRENT_USER_ID } from '@/lib/constants';
import { formatDate, formatDateTime } from '@/lib/date';
import { formatNumber } from '@/lib/format';

type RepositoryTabValue = 'readme' | 'pullRequests' | 'contributors' | 'mergeHistory' | 'insights';
type PullRequestSort = 'recent' | 'grade' | 'recommended';
type ContributorSort = 'count' | 'recent';

type RepositoryTabsProps = {
  repository: Repository;
  pullRequests: PullRequest[];
  users: User[];
  mergeHistory: MergeHistoryEntry[];
};

const gradeRank = {
  MAJOR: 3,
  NORMAL: 2,
  MINOR: 1,
};

const filterOptions: Array<{
  label: string;
  value: 'OPEN' | 'REVIEWING' | 'CHANGES_REQUESTED' | 'CLOSED' | 'MINE';
}> = [
  { label: 'Open', value: 'OPEN' },
  { label: 'Reviewing', value: 'REVIEWING' },
  { label: 'Changes Requested', value: 'CHANGES_REQUESTED' },
  { label: 'Closed', value: 'CLOSED' },
  { label: '내 PR만', value: 'MINE' },
];

const closedStatuses: PullRequestStatus[] = ['ACCEPTED', 'MERGED', 'REJECTED'];

const getUser = (users: User[], userId: string) => users.find((user) => user.id === userId);

export const RepositoryTabs = ({
  repository,
  pullRequests,
  users,
  mergeHistory,
}: RepositoryTabsProps) => {
  const [activeTab, setActiveTab] = useState<RepositoryTabValue>('readme');
  const [activePrFilters, setActivePrFilters] = useState<string[]>(['OPEN']);
  const [pullRequestSort, setPullRequestSort] = useState<PullRequestSort>('recent');
  const [contributorSort, setContributorSort] = useState<ContributorSort>('count');

  const filteredPullRequests = pullRequests
    .filter((pullRequest) => {
      if (!activePrFilters.length) {
        return true;
      }

      const mineOnly = activePrFilters.includes('MINE');
      const statusFilters = activePrFilters.filter((filter) => filter !== 'MINE');
      const statusMatches = statusFilters.length
        ? statusFilters.some((filter) => {
        if (filter === 'CLOSED') {
          return closedStatuses.includes(pullRequest.status);
        }

        return pullRequest.status === filter;
      })
        : true;
      const mineMatches = mineOnly ? pullRequest.authorId === MOCK_CURRENT_USER_ID : true;

      return statusMatches && mineMatches;
    })
    .sort((a, b) => {
      if (pullRequestSort === 'grade') {
        return gradeRank[b.finalGrade] - gradeRank[a.finalGrade];
      }

      if (pullRequestSort === 'recommended') {
        return b.aiGrading.totalScore - a.aiGrading.totalScore;
      }

      return (
        new Date(b.timestamps.submittedAt ?? b.timestamps.draftStartedAt).getTime() -
        new Date(a.timestamps.submittedAt ?? a.timestamps.draftStartedAt).getTime()
      );
    });

  const contributorSummaries = users
    .map((user) => {
      const authored = pullRequests.filter((pullRequest) => pullRequest.authorId === user.id);
      const merged = authored.filter((pullRequest) => pullRequest.status === 'MERGED');
      const recentTime = Math.max(
        0,
        ...authored.map((pullRequest) =>
          new Date(pullRequest.timestamps.submittedAt ?? pullRequest.timestamps.draftStartedAt).getTime(),
        ),
      );

      return {
        user,
        contributionCount: authored.length,
        majorMergeCount: merged.filter((pullRequest) => pullRequest.finalGrade === 'MAJOR').length,
        recentTime,
      };
    })
    .filter((summary) => summary.contributionCount > 0)
    .sort((a, b) => {
      if (contributorSort === 'recent') {
        return b.recentTime - a.recentTime;
      }

      return b.contributionCount - a.contributionCount;
    });

  const toggleFilter = (filter: string) => {
    setActivePrFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
    );
  };

  const tabs: TabItem<RepositoryTabValue>[] = [
    {
      value: 'readme',
      label: 'README',
      content: <RepositoryReadme repository={repository} />,
    },
    {
      value: 'pullRequests',
      label: 'Pull Requests',
      badge: <Badge tone="slate">{pullRequests.length}</Badge>,
      content: (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => toggleFilter(option.value)}
                  size="sm"
                  variant={activePrFilters.includes(option.value) ? 'primary' : 'secondary'}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <select
              className="h-9 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-accent-300"
              onChange={(event) => setPullRequestSort(event.target.value as PullRequestSort)}
              value={pullRequestSort}
            >
              <option value="recent">최신순</option>
              <option value="grade">등급 높은순</option>
              <option value="recommended">추천순</option>
            </select>
          </div>

          {filteredPullRequests.length ? (
            <div className="space-y-3">
              {filteredPullRequests.map((pullRequest) => (
                <PullRequestListItem
                  key={pullRequest.id}
                  author={getUser(users, pullRequest.authorId)}
                  pullRequest={pullRequest}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="조건에 맞는 PR이 없습니다"
              description="다른 상태 필터를 선택하거나 내 PR 필터를 해제해보세요."
            />
          )}
        </div>
      ),
    },
    {
      value: 'contributors',
      label: 'Contributors',
      badge: <Badge tone="slate">{contributorSummaries.length}</Badge>,
      content: (
        <div className="space-y-4">
          <div className="flex justify-end">
            <select
              className="h-9 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-accent-300"
              onChange={(event) => setContributorSort(event.target.value as ContributorSort)}
              value={contributorSort}
            >
              <option value="count">기여 많은순</option>
              <option value="recent">최근 활동순</option>
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {contributorSummaries.map((summary) => (
              <article key={summary.user.id} className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
                <ContributorBadge
                  meta={`${formatNumber(summary.contributionCount)} contributions`}
                  user={summary.user}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone="teal">기여 {formatNumber(summary.contributionCount)}</Badge>
                  <Badge tone="amber">Major Merge {formatNumber(summary.majorMergeCount)}</Badge>
                </div>
              </article>
            ))}
          </div>
        </div>
      ),
    },
    {
      value: 'mergeHistory',
      label: 'Merge History',
      badge: <Badge tone="slate">{mergeHistory.length}</Badge>,
      content: (
        <div className="space-y-4">
          {mergeHistory.length ? (
            mergeHistory.map((entry) => {
              const contributor = getUser(users, entry.contributorId);

              return (
                <article key={entry.id} className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <GradeBadge compact grade={entry.grade} />
                      <h3 className="mt-3 text-base font-semibold text-white">{entry.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{entry.summary}</p>
                    </div>
                    <div className="text-sm text-slate-400 lg:text-right">
                      <p>@{contributor?.username ?? 'unknown'}</p>
                      <p className="mt-1">{formatDate(entry.mergedAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <LinkIcon className="size-3.5" />
                    <span>/r/{entry.repositoryId}/pr/{entry.pullRequestId}/review</span>
                  </div>
                </article>
              );
            })
          ) : (
            <EmptyState title="아직 Merge 이력이 없습니다" description="첫 공식 기여가 생기면 이곳에 타임라인이 쌓입니다." />
          )}
        </div>
      ),
    },
    {
      value: 'insights',
      label: 'Insights',
      content: (
        <EmptyState
          icon={<BarChart3 className="size-5" />}
          title="데이터를 수집 중입니다"
          description="기여 패턴, 리뷰 속도, 머지 품질 지표는 더 많은 활동이 쌓이면 제공됩니다."
        />
      ),
    },
  ];

  return <Tabs items={tabs} onValueChange={setActiveTab} value={activeTab} />;
};
