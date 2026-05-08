import { useEffect, useState } from 'react';
import { Bookmark, ExternalLink, Eye, GitPullRequest } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { RepoStatsBar } from '@/components/repository/RepoStatsBar';
import { RepositoryTabs } from '@/components/repository/RepositoryTabs';
import type { MergeHistoryEntry, PullRequest } from '@/features/pull-request/pullRequest.types';
import { pullRequestService } from '@/features/pull-request/pullRequest.service';
import type { Repository } from '@/features/repository/repository.types';
import { repositoryService } from '@/features/repository/repository.service';
import type { User } from '@/features/user/user.types';
import { userService } from '@/features/user/user.service';
import {
  REPOSITORY_BADGE_LABELS,
  WORK_SCALE_LABELS,
} from '@/lib/constants';

export const RepositoryDetailPage = () => {
  const { repoId } = useParams();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [mergeHistory, setMergeHistory] = useState<MergeHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!repoId) {
      return;
    }

    let mounted = true;

    const fetchRepositoryDetail = async () => {
      setIsLoading(true);
      const [nextRepository, nextUsers, nextPullRequests, nextMergeHistory] = await Promise.all([
        repositoryService.getRepositoryById(repoId),
        userService.getUsers(),
        pullRequestService.getPullRequests({ repositoryId: repoId }),
        repositoryService.getRepositoryMergeHistory(repoId),
      ]);

      if (!mounted) {
        return;
      }

      setRepository(nextRepository);
      setUsers(nextUsers);
      setPullRequests(nextPullRequests);
      setMergeHistory(nextMergeHistory);
      setIsLoading(false);
    };

    fetchRepositoryDetail();

    return () => {
      mounted = false;
    };
  }, [repoId]);

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
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            to="/search"
          >
            검색으로 돌아가기
          </Link>
        }
        title="존재하지 않는 repository ID입니다"
        description="mock data에 없는 세계관입니다. 검색 화면에서 열려 있는 레포지토리를 확인해보세요."
      />
    );
  }

  const author = users.find((user) => user.id === repository.authorId);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
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
              <Badge tone="blue">{repository.genre}</Badge>
              <Badge tone="slate">{WORK_SCALE_LABELS[repository.workScale]}</Badge>
              {repository.badges.map((badge) => (
                <Badge key={badge} tone={badge === 'NEW' ? 'amber' : 'teal'}>
                  {REPOSITORY_BADGE_LABELS[badge]}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-950 md:text-5xl">{repository.title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  {repository.description}
                </p>
                {author ? (
                  <div className="mt-4 flex items-center gap-3">
                    <img
                      alt={`${author.displayName} avatar`}
                      className="size-9 rounded-lg border border-slate-200 bg-slate-100"
                      src={author.avatar}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{author.displayName}</p>
                      <p className="text-xs text-slate-500">@{author.username}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  leftIcon={<Eye className="size-4" />}
                  onClick={() => setIsWatching((value) => !value)}
                  variant={isWatching ? 'primary' : 'secondary'}
                >
                  Watch
                </Button>
                <Button
                  leftIcon={<Bookmark className="size-4" />}
                  onClick={() => setIsBookmarked((value) => !value)}
                  variant={isBookmarked ? 'primary' : 'secondary'}
                >
                  Bookmark
                </Button>
                <Link
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  to={`/r/${repository.id}/pr/new`}
                >
                  <GitPullRequest className="size-4" />
                  Contribute 기여하기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {repository.tags.map((tag) => (
          <Link
            key={tag}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-accent-300 hover:text-slate-950"
            to={`/search?tag=${encodeURIComponent(tag)}`}
          >
            #{tag}
          </Link>
        ))}
      </div>

      {repository.externalLinks.length ? (
        <div className="flex flex-wrap gap-2">
          {repository.externalLinks.map((link) => (
            <a
              key={link.url}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-accent-300 hover:text-slate-950"
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

      <RepoStatsBar repository={repository} />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
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
