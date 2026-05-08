import { useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { Tabs, type TabItem } from '@/components/common/Tabs';
import { GradeBadge } from '@/components/pull-request/GradeBadge';
import { PullRequestListItem } from '@/components/pull-request/PullRequestListItem';
import { RepositoryReadme } from '@/components/repository/RepositoryReadme';
import type { MergeHistoryEntry, PullRequest, PullRequestStatus } from '@/features/pull-request/pullRequest.types';
import type { Repository } from '@/features/repository/repository.types';
import type { User } from '@/features/user/user.types';
import { MOCK_CURRENT_USER_ID } from '@/lib/constants';
import { formatDate } from '@/lib/date';

type RepositoryTabValue = 'readme' | 'pullRequests' | 'mergeHistory';
type PullRequestSort = 'recent' | 'grade' | 'recommended';

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
  { label: '접수됨', value: 'OPEN' },
  { label: '검토 중', value: 'REVIEWING' },
  { label: '수정 요청됨', value: 'CHANGES_REQUESTED' },
  { label: '종료됨', value: 'CLOSED' },
  { label: '내 제안만', value: 'MINE' },
];

const closedStatuses: PullRequestStatus[] = ['ACCEPTED', 'MERGED', 'REJECTED'];

const getUser = (users: User[], userId: string) =>
  users.find((user) => user.id === userId || user.username === userId);

export const RepositoryTabs = ({
  repository,
  pullRequests,
  users,
  mergeHistory,
}: RepositoryTabsProps) => {
  const [activeTab, setActiveTab] = useState<RepositoryTabValue>('readme');
  const [activePrFilters, setActivePrFilters] = useState<string[]>(['OPEN']);
  const [pullRequestSort, setPullRequestSort] = useState<PullRequestSort>('recent');

  const filteredPullRequests = pullRequests
    .filter((pullRequest) => {
      if (!activePrFilters.length) return true;
      const mineOnly = activePrFilters.includes('MINE');
      const statusFilters = activePrFilters.filter((f) => f !== 'MINE');
      const statusMatches = statusFilters.length
        ? statusFilters.some((filter) =>
            filter === 'CLOSED'
              ? closedStatuses.includes(pullRequest.status)
              : pullRequest.status === filter,
          )
        : true;
      const mineMatches = mineOnly ? pullRequest.authorId === MOCK_CURRENT_USER_ID : true;
      return statusMatches && mineMatches;
    })
    .sort((a, b) => {
      if (pullRequestSort === 'grade') return gradeRank[b.finalGrade] - gradeRank[a.finalGrade];
      if (pullRequestSort === 'recommended') return b.aiGrading.totalScore - a.aiGrading.totalScore;
      return (
        new Date(b.timestamps.submittedAt ?? b.timestamps.draftStartedAt).getTime() -
        new Date(a.timestamps.submittedAt ?? a.timestamps.draftStartedAt).getTime()
      );
    });

  const toggleFilter = (filter: string) => {
    setActivePrFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
    );
  };

  const tabs: TabItem<RepositoryTabValue>[] = [
    {
      value: 'readme',
      label: '작품 소개',
      content: <RepositoryReadme repository={repository} />,
    },
    {
      value: 'pullRequests',
      label: '모인 제안',
      badge: <Badge tone="slate">{pullRequests.length}</Badge>,
      content: (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleFilter(option.value)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    activePrFilters.includes(option.value)
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <select
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/15"
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
              icon={null}
              title="아직 제안이 없네요"
              description="다른 필터를 선택해보거나 첫 번째 제안자가 되어보세요."
            />
          )}
        </div>
      ),
    },
    {
      value: 'mergeHistory',
      label: '반영된 것들',
      badge: <Badge tone="slate">{mergeHistory.length}</Badge>,
      content: (
        <div className="space-y-3">
          {mergeHistory.length ? (
            mergeHistory.map((entry) => {
              const contributor = getUser(users, entry.contributorId);
              return (
                <article key={entry.id} className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <GradeBadge compact grade={entry.grade} />
                      <h3 className="mt-3 text-base font-semibold text-slate-900">{entry.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{entry.summary}</p>
                    </div>
                    <div className="shrink-0 text-sm text-slate-400 lg:text-right">
                      <p>@{contributor?.username ?? 'unknown'}</p>
                      <p className="mt-1">{formatDate(entry.mergedAt)}</p>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <EmptyState
              title="아직 반영된 제안이 없어요"
              description="첫 번째 제안이 반영되면 여기에 기록돼요."
            />
          )}
        </div>
      ),
    },
  ];

  return <Tabs items={tabs} onValueChange={setActiveTab} value={activeTab} />;
};
