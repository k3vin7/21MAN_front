import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Link as LinkIcon, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { Tabs, type TabItem } from '@/components/common/Tabs';
import { AchievementBadge } from '@/components/contributor/AchievementBadge';
import { ActivityGraph } from '@/components/contributor/ActivityGraph';
import { ContributionSummaryCard } from '@/components/contributor/ContributionSummaryCard';
import { RepoDetailModal } from '@/components/repository/RepoDetailModal';
import { RepoGrid } from '@/components/repository/RepoGrid';
import type { PullRequest } from '@/features/pull-request/pullRequest.types';
import { pullRequestService } from '@/features/pull-request/pullRequest.service';
import type { Repository } from '@/features/repository/repository.types';
import { repositoryService } from '@/features/repository/repository.service';
import type { Achievement, ProfileActivity, User } from '@/features/user/user.types';
import { userService } from '@/features/user/user.service';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/lib/date';
import { formatNumber } from '@/lib/format';

type ProfileTab = 'contribution' | 'repository' | 'activity' | 'achievements';

export const UserProfilePage = () => {
  const { username = '' } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [activities, setActivities] = useState<ProfileActivity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>('contribution');
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      setIsLoading(true);
      const nextUser = await userService.getUserByUsername(username);
      const [nextUsers, nextRepositories] = await Promise.all([
        userService.getUsers(),
        repositoryService.getRepositories(),
      ]);
      const [nextPullRequests, nextActivities, nextAchievements] = nextUser
        ? await Promise.all([
            pullRequestService.getPullRequests({ authorId: nextUser.id }),
            userService.getProfileActivities(nextUser.id),
            userService.getAchievements(nextUser.id),
          ])
        : [[], [], []];

      if (!mounted) {
        return;
      }

      setUser(nextUser);
      setUsers(nextUsers);
      setRepositories(nextRepositories);
      setPullRequests(nextPullRequests);
      setActivities(nextActivities);
      setAchievements(nextAchievements);
      setSelectedAchievementId(nextAchievements[0]?.id ?? null);
      setIsLoading(false);
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [username]);

  const ownedRepositories = user
    ? repositories.filter((repository) => repository.authorId === user.id)
    : [];

  const contributionGroups = useMemo(() => {
    if (!user) {
      return [];
    }

    return repositories
      .map((repository) => ({
        repository,
        pullRequests: pullRequests.filter((pullRequest) => pullRequest.repositoryId === repository.id),
      }))
      .filter((group) => group.pullRequests.length > 0);
  }, [pullRequests, repositories, user]);

  const selectedAchievement = achievements.find((achievement) => achievement.id === selectedAchievementId);
  const selectedAuthor = selectedRepository
    ? users.find((item) => item.id === selectedRepository.authorId)
    : undefined;

  if (isLoading) {
    return <Skeleton className="mx-auto h-[760px] max-w-6xl" />;
  }

  if (!user) {
    return (
      <EmptyState
        action={
          <Link className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-slate-950" to="/search">
            세계관 탐색
          </Link>
        }
        title="프로필을 찾지 못했습니다"
        description="mock user 목록에 없는 username입니다."
      />
    );
  }

  const tabs: TabItem<ProfileTab>[] = [
    {
      value: 'contribution',
      label: 'Contribution',
      badge: <Badge tone="slate">{pullRequests.length}</Badge>,
      content: (
        <div className="grid gap-4 xl:grid-cols-2">
          {contributionGroups.length ? (
            contributionGroups.map((group) => (
              <ContributionSummaryCard
                key={group.repository.id}
                pullRequests={group.pullRequests}
                repository={group.repository}
              />
            ))
          ) : (
            <EmptyState title="아직 기여한 세계관이 없습니다" />
          )}
        </div>
      ),
    },
    {
      value: 'repository',
      label: 'Repository',
      badge: <Badge tone="slate">{ownedRepositories.length}</Badge>,
      content: ownedRepositories.length ? (
        <RepoGrid onRepoClick={setSelectedRepository} repositories={ownedRepositories} users={users} />
      ) : (
        <EmptyState title="소유한 레포지토리가 없습니다" description="원작자로 세계관을 열면 이곳에 표시됩니다." />
      ),
    },
    {
      value: 'activity',
      label: 'Activity',
      content: (
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ActivityGraph activities={activities} />
          <div className="space-y-3">
            {activities.length ? (
              activities.map((activity) => (
                <article key={activity.id} className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
                  <p className="text-sm font-semibold text-white">{activity.title}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(activity.occurredAt)}</p>
                </article>
              ))
            ) : (
              <EmptyState title="최근 활동이 없습니다" />
            )}
          </div>
        </div>
      ),
    },
    {
      value: 'achievements',
      label: 'Achievements',
      badge: <Badge tone="slate">{achievements.length}</Badge>,
      content: (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                onClick={() => setSelectedAchievementId(achievement.id)}
                selected={achievement.id === selectedAchievementId}
              />
            ))}
          </div>
          <aside className="h-fit rounded-lg border border-white/10 bg-slate-900/70 p-5">
            <h3 className="text-base font-semibold text-white">Badge detail</h3>
            {selectedAchievement ? (
              <div className="mt-4 text-sm leading-6 text-slate-300">
                <p className="font-semibold text-white">{selectedAchievement.title}</p>
                <p className="mt-2">{selectedAchievement.description}</p>
                <p className="mt-3 text-slate-500">{formatDateTime(selectedAchievement.earnedAt)}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">업적을 선택하세요.</p>
            )}
          </aside>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-lg border border-white/10 bg-slate-900/70 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <img
              alt={`${user.displayName} avatar`}
              className="size-28 rounded-lg border border-white/10 bg-slate-800"
              src={user.avatar}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {user.roles.includes('AUTHOR') ? <Badge tone="teal">원작자</Badge> : null}
                {user.roles.includes('CONTRIBUTOR') ? <Badge tone="blue">컨트리뷰터</Badge> : null}
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white">@{user.username}</h1>
              <p className="mt-1 text-lg text-slate-300">{user.displayName}</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">{user.bio}</p>
              {user.links?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {user.links.map((link) => (
                    <a
                      key={link.url}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-accent-300/40 hover:text-white"
                      href={link.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.type}
                      <ExternalLink className="size-3.5" />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              leftIcon={<Share2 className="size-4" />}
              onClick={() => toast({ title: '프로필 공유 링크를 준비했습니다', tone: 'success' })}
              variant="secondary"
            >
              Share profile
            </Button>
            <Button
              leftIcon={<LinkIcon className="size-4" />}
              onClick={() => toast({ title: '인용용 프로필 링크를 준비했습니다', tone: 'success' })}
              variant="secondary"
            >
              Cite profile
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Major Merge" value={user.stats.majorMerges} />
        <StatCard label="Normal Merge" value={user.stats.normalMerges} />
        <StatCard label="Minor Merge" value={user.stats.minorMerges} />
        <StatCard label="Repository" value={user.stats.repositoriesOwned} />
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-950/40 p-4 md:p-5">
        <Tabs items={tabs} onValueChange={setActiveTab} value={activeTab} />
      </section>

      <RepoDetailModal
        author={selectedAuthor}
        isOpen={Boolean(selectedRepository)}
        onClose={() => setSelectedRepository(null)}
        repository={selectedRepository}
      />
    </div>
  );
};

type StatCardProps = {
  label: string;
  value: number;
};

const StatCard = ({ label, value }: StatCardProps) => {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{formatNumber(value)}</p>
    </article>
  );
};

