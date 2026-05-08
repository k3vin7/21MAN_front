import { useEffect, useState } from 'react';
import { ExternalLink, GitPullRequest } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { RepoStatsBar } from '@/components/repository/RepoStatsBar';
import { RepositoryTabs } from '@/components/repository/RepositoryTabs';
import { useAuthStore } from '@/features/auth/auth.store';
import type { MergeHistoryEntry, PullRequest } from '@/features/pull-request/pullRequest.types';
import { pullRequestService } from '@/features/pull-request/pullRequest.service';
import type { Repository } from '@/features/repository/repository.types';
import { repositoryService } from '@/features/repository/repository.service';
import type { User } from '@/features/user/user.types';
import { userService } from '@/features/user/user.service';
import { REPOSITORY_BADGE_LABELS } from '@/lib/constants';

export const RepositoryDetailPage = () => {
  const { repoId } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [mergeHistory, setMergeHistory] = useState<MergeHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!repoId) {
      return;
    }

    let mounted = true;

    const fetchRepositoryDetail = async () => {
      setIsLoading(true);
      const nextRepository = await repositoryService.getRepositoryById(repoId);
      const authorId = nextRepository?.authorId;
      const authorProfilePromise = authorId
        ? currentUser?.username === authorId
          ? userService.getCurrentUserProfile()
          : userService.getUserByUsername(authorId)
        : Promise.resolve(null);
      const [nextUsers, nextPullRequests, nextMergeHistory, authorProfile] = await Promise.all([
        userService.getUsers(),
        pullRequestService.getPullRequests({ repositoryId: repoId }),
        repositoryService.getRepositoryMergeHistory(repoId),
        authorProfilePromise,
      ]);

      if (!mounted) {
        return;
      }

      const mergedUsers = authorProfile && !nextUsers.some((user) => user.id === authorProfile.id)
        ? [authorProfile, ...nextUsers]
        : nextUsers;

      setRepository(nextRepository);
      setUsers(mergedUsers);
      setPullRequests(nextPullRequests);
      setMergeHistory(nextMergeHistory);
      setIsLoading(false);
    };

    fetchRepositoryDetail();

    return () => {
      mounted = false;
    };
  }, [repoId, currentUser?.username]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-72" />
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!repository) {
    return (
      <EmptyState
        action={
          <Link
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            to="/search"
          >
            작품 검색으로 돌아가기
          </Link>
        }
        title="존재하지 않는 작품입니다"
        description="검색 화면에서 다른 작품을 찾아보세요."
      />
    );
  }

  const author = users.find((user) => user.id === repository.authorId || user.username === repository.authorId);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="relative h-64 md:h-80">
          <img
            alt=""
            className="size-full object-cover opacity-70"
            loading="lazy"
            src={repository.thumbnail}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/10" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur-sm">
                {repository.genre}
              </span>
              {repository.badges.includes('NEW') && (
                <span className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-amber-900">
                  {REPOSITORY_BADGE_LABELS['NEW']}
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{repository.title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  {repository.description}
                </p>
                {author && (
                  <div className="mt-4 flex items-center gap-3">
                    <img
                      alt={`${author.displayName} avatar`}
                      className="size-9 rounded-xl border border-white/50 bg-slate-100"
                      src={author.avatar}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{author.displayName}</p>
                      <p className="text-xs text-slate-500">@{author.username}</p>
                    </div>
                  </div>
                )}
              </div>

              <Link
                className="inline-flex h-11 items-center gap-2 self-start rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 lg:self-auto"
                to={`/r/${repository.id}/pr/new`}
              >
                <GitPullRequest className="size-4" />
                나도 참여할게요
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-2xl bg-white px-5 py-4 shadow-sm space-y-4">
        <RepoStatsBar repository={repository} />
        {(repository.tags.length > 0 || repository.externalLinks.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {repository.tags.map((tag) => (
              <Link
                key={tag}
                className="rounded-xl bg-slate-50 px-3 py-1.5 text-sm text-slate-500 transition hover:text-slate-900"
                to={`/search?tag=${encodeURIComponent(tag)}`}
              >
                #{tag}
              </Link>
            ))}
            {repository.externalLinks.map((link) => (
              <a
                key={link.url}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-sm text-slate-500 transition hover:text-slate-900"
                href={link.url}
                rel="noreferrer"
                target="_blank"
              >
                {link.type}
                <ExternalLink className="size-3.5" />
              </a>
            ))}
          </div>
        )}
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
        <RepositoryTabs
          mergeHistory={mergeHistory}
          pullRequests={pullRequests}
          repository={repository}
          users={users}
        />
      </section>
    </div>
  );
};
