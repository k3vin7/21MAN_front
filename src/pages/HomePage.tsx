import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, GitPullRequest, Search, Sparkles, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { ContributorCard } from '@/components/contributor/ContributorCard';
import { RepoDetailModal } from '@/components/repository/RepoDetailModal';
import { RepoGrid } from '@/components/repository/RepoGrid';
import type { Repository } from '@/features/repository/repository.types';
import { repositoryService } from '@/features/repository/repository.service';
import type { FeaturedContributor, User } from '@/features/user/user.types';
import { userService } from '@/features/user/user.service';
import { RECOMMENDED_TAGS } from '@/lib/constants';

export const HomePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [featuredContributors, setFeaturedContributors] = useState<FeaturedContributor[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchHomeData = async () => {
      setIsLoading(true);
      const [featuredRepositories, nextUsers, nextFeaturedContributors] = await Promise.all([
        repositoryService.getFeaturedRepositories(4),
        userService.getUsers(),
        userService.getFeaturedContributors(),
      ]);

      if (!mounted) {
        return;
      }

      setRepositories(featuredRepositories);
      setUsers(nextUsers);
      setFeaturedContributors(nextFeaturedContributors);
      setIsLoading(false);
    };

    fetchHomeData();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedAuthor = selectedRepository
    ? users.find((user) => user.id === selectedRepository.authorId)
    : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = query.trim();
    navigate(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : '/search');
  };

  const getContributorUser = (featured: FeaturedContributor) => {
    return users.find((user) => user.id === featured.userId);
  };

  return (
    <div className="space-y-12">
      <section className="grid min-h-[520px] items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-300">
            Collaborative Worldbuilding
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold text-white sm:text-6xl">
            여러분의 첫 크레딧은 여기서 시작됩니다
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            다른 창작자의 세계관에 기여하고, 내 창작 이력을 쌓는 공동창작 플랫폼.
          </p>

          <form className="mt-8 max-w-2xl" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="home-search">
              세계관 검색
            </label>
            <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-slate-900/80 p-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="home-search"
                  className="h-12 w-full rounded-md border border-transparent bg-slate-950/70 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-accent-300/60"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="전통설화, SF, 캐릭터 모집..."
                  type="search"
                  value={query}
                />
              </div>
              <Button className="h-12" rightIcon={<ArrowRight className="size-4" />} type="submit">
                검색
              </Button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {RECOMMENDED_TAGS.map((tag) => (
              <Link
                key={tag}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-accent-300/40 hover:text-white"
                to={`/search?tag=${encodeURIComponent(tag)}`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
          <Sparkles className="size-6 text-accent-300" />
          <h2 className="mt-4 text-lg font-semibold text-white">오늘의 기여 흐름</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>모집 중인 영역</span>
              <strong className="text-white">24</strong>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>이번 주 Merge</span>
              <strong className="text-white">5</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>평균 리뷰</span>
              <strong className="text-white">2.8일</strong>
            </div>
          </div>
        </aside>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">지금 기여자를 찾는 세계관</h2>
            <p className="mt-2 text-sm text-slate-400">카드를 눌러 README와 모집 영역을 먼저 훑어볼 수 있습니다.</p>
          </div>
          <Link className="hidden text-sm font-medium text-accent-200 hover:text-accent-100 sm:inline" to="/search">
            전체 보기
          </Link>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-80" />
              ))}
            </div>
          ) : repositories.length ? (
            <RepoGrid onRepoClick={setSelectedRepository} repositories={repositories} users={users} />
          ) : (
            <EmptyState title="모집 중인 세계관이 없습니다" description="필터를 낮추면 더 많은 레포지토리를 볼 수 있습니다." />
          )}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">이번 주 주목받는 컨트리뷰터</h2>
            <p className="mt-2 text-sm text-slate-400">팬이 아니라 공동창작자로 남는 사람들입니다.</p>
          </div>
          <Users className="hidden size-6 text-accent-300 sm:block" />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredContributors.map((featured) => {
            const user = getContributorUser(featured);

            return user ? <ContributorCard key={featured.userId} featured={featured} user={user} /> : null;
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-white/10 bg-slate-900/70 p-6">
          <GitPullRequest className="size-6 text-accent-300" />
          <h2 className="mt-4 text-xl font-semibold text-white">컨트리뷰터로 시작</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            다른 사람 세계관에 기여하면서 창작 이력을 쌓아보세요.
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-200 hover:text-accent-100"
            to="/search"
          >
            세계관 둘러보기
            <ArrowRight className="size-4" />
          </Link>
        </article>

        <article className="rounded-lg border border-white/10 bg-slate-900/70 p-6">
          <Sparkles className="size-6 text-accent-300" />
          <h2 className="mt-4 text-xl font-semibold text-white">원작자로 시작</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            내 세계관을 등록하고 함께 키워갈 동료를 만나보세요.
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-200 hover:text-accent-100"
            to="/r/new"
          >
            세계관 등록하기
            <ArrowRight className="size-4" />
          </Link>
        </article>
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

