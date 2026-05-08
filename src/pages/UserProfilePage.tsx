import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { ContributionSummaryCard } from '@/components/contributor/ContributionSummaryCard';
import { RepoDetailModal } from '@/components/repository/RepoDetailModal';
import { RepoGrid } from '@/components/repository/RepoGrid';
import type { PullRequest } from '@/features/pull-request/pullRequest.types';
import { pullRequestService } from '@/features/pull-request/pullRequest.service';
import type { Repository } from '@/features/repository/repository.types';
import { repositoryService } from '@/features/repository/repository.service';
import { useAuthStore } from '@/features/auth/auth.store';
import type { User } from '@/features/user/user.types';
import { userService } from '@/features/user/user.service';
import { formatNumber } from '@/lib/format';

type ProfileTab = 'contribution' | 'repository';

export const UserProfilePage = () => {
  const { username = '' } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>('contribution');
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      setIsLoading(true);

      try {
        const isCurrentUserProfile = Boolean(currentUser?.username && currentUser.username === username);
        const nextUser = isCurrentUserProfile
          ? await userService.getCurrentUserProfile()
          : await userService.getUserByUsername(username);
        const targetUsername = nextUser?.username ?? username;
        const [nextUsers, nextRepositories] = await Promise.all([
          userService.getUsers(),
          repositoryService.getUserRepositories(targetUsername),
        ]);
        const nextPullRequests = nextUser
          ? await pullRequestService.getPullRequests({
              authorId: nextUser.id,
              authorUsername: nextUser.username,
            })
          : [];

        if (!mounted) {
          return;
        }

        setUser(nextUser);
        setUsers(nextUsers);
        setRepositories(nextRepositories);
        setPullRequests(nextPullRequests);
      } catch {
        if (!mounted) {
          return;
        }

        setUser(null);
        setUsers([]);
        setRepositories([]);
        setPullRequests([]);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [currentUser?.username, username]);

  const ownedRepositories = repositories;

  const contributionGroups = useMemo(() => {
    if (!user) {
      return [];
    }

    return repositories
      .map((repository) => ({
        repository,
        pullRequests: pullRequests.filter(
          (pullRequest) =>
            pullRequest.repositoryId === repository.id && pullRequest.status === 'MERGED',
        ),
      }))
      .filter((group) => group.pullRequests.length > 0);
  }, [pullRequests, repositories, user]);

  const selectedAuthor = selectedRepository
    ? users.find(
        (item) => item.id === selectedRepository.authorId || item.username === selectedRepository.authorId,
      )
    : undefined;
  const officialCredits = user
    ? user.stats.majorMerges + user.stats.normalMerges + user.stats.minorMerges
    : 0;

  if (isLoading) {
    return <Skeleton className="mx-auto h-[760px] max-w-6xl" />;
  }

  if (!user) {
    return (
      <EmptyState
        action={
          <Link className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white" to="/search">
            세계관 탐색
          </Link>
        }
        title="프로필을 찾지 못했습니다"
        description="존재하지 않거나 아직 공개되지 않은 사용자입니다."
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <section className="pt-2">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
            <img
              alt={`${user.displayName} avatar`}
              className="size-20 rounded-[1.25rem] bg-slate-100"
              src={user.avatar}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-400">
                {[user.roles.includes('AUTHOR') ? '원작자' : null, user.roles.includes('CONTRIBUTOR') ? '공동창작자' : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <h1 className="mt-2 break-words text-4xl font-bold tracking-normal text-slate-950">@{user.username}</h1>
              <p className="mt-2 text-lg text-slate-500">{user.displayName}</p>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-600">
                {user.bio || '다른 사람의 세계관에 캐릭터, 설정, 에피소드를 제안하고 채택된 기록을 남깁니다.'}
              </p>
              {user.links?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {user.links.map((link) => (
                    <a
                      key={link.url}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
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

          <div className="sm:min-w-[180px] sm:text-right">
            <p className="text-sm font-semibold text-slate-500">참여 이력</p>
            <p className="mt-1 text-6xl font-bold tracking-normal text-slate-950">{formatNumber(officialCredits)}</p>
            <p className="mt-2 text-sm text-slate-500">공식 반영된 제안</p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex gap-6 border-b border-slate-100">
          <ProfileTabButton
            active={activeTab === 'contribution'}
            count={officialCredits}
            label="참여 이력"
            onClick={() => setActiveTab('contribution')}
          />
          <ProfileTabButton
            active={activeTab === 'repository'}
            count={ownedRepositories.length}
            label="내 세계관"
            onClick={() => setActiveTab('repository')}
          />
        </div>

        {activeTab === 'contribution' ? (
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
              <ProfileEmptyState
                title="아직 참여 이력이 없습니다"
                description="세계관에 창작 제안을 보내고 원작자가 공식 반영하면 이곳에 기록됩니다."
              />
            )}
          </div>
        ) : ownedRepositories.length ? (
          <RepoGrid onRepoClick={setSelectedRepository} repositories={ownedRepositories} users={users} />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <ProfileEmptyState
              title="소유한 세계관이 없습니다"
              description="원작자로 세계관을 열면 이곳에 표시됩니다."
            />
          </div>
        )}
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

const ProfileTabButton = ({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      className={`border-b-2 pb-3 text-base font-bold transition ${
        active ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400 hover:text-slate-700'
      }`}
      onClick={onClick}
      type="button"
    >
      {label} <span className="ml-1">{formatNumber(count)}</span>
    </button>
  );
};

const ProfileEmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-8">
      <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
};
