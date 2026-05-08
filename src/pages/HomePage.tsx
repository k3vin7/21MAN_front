import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowRight,
  Search,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
import dinosaur from "@/assets/dinosaur.png";
import ufo from "@/assets/ufo.png";

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
    <div className="space-y-20">
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
        <img
          src={dinosaur}
          alt="공룡"
          className="pointer-events-none absolute left-0 top-[310px] z-0 hidden h-auto w-[min(22vw,280px)] select-none object-contain opacity-80 md:block"
        />
        <img
          src={ufo}
          alt="ufo"
          className="pointer-events-none absolute right-0 top-24 z-0 hidden h-auto w-[min(18vw,220px)] select-none object-contain opacity-80 rotate-12 md:block"
        />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-10rem)] max-w-2xl flex-col items-center justify-center pb-16 text-center">
          <h1 className="mx-auto text-3xl font-bold leading-tight tracking-normal text-slate-950 sm:text-4xl">
            좋아하는 웹툰 세계에 참여하세요!
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-500">
            캐릭터, 에피소드, 설정을 제안하고 원작자가 채택하면 내 참여 이력으로 남습니다.
          </p>

          <form className="mt-8 w-full" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="home-search">
              세계관 검색
            </label>
            <div className="flex h-14 items-center gap-3 rounded-2xl bg-slate-100 px-4 text-left transition focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-950/10">
              <Search className="size-5 shrink-0 text-slate-400" />
              <div className="relative min-w-0 flex-1">
                <input
                  id="home-search"
                  className="h-12 w-full bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="웹툰 제목, 장르, 세계관 검색"
                  type="search"
                  value={query}
                />
              </div>

              <button
                aria-label="검색 실행"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-slate-800"
                type="submit"
              >
                <ArrowRight className="size-5" />
              </button>
            </div>

          </form>

          <div className="mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
            {RECOMMENDED_TAGS.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                to={`/search?tag=${encodeURIComponent(tag)}`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-slate-950">창작 제안을 기다리는 웹툰</h2>
            <p className="mt-2 text-sm text-slate-500">카드를 눌러 작품 세계관을 살펴보세요.</p>
          </div>
          <Link className="hidden text-sm font-bold text-slate-500 hover:text-slate-950 sm:inline" to="/search">
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
            <EmptyState title="창작 제안을 기다리는 웹툰이 없습니다" description="검색 조건을 바꿔보세요." />
          )}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-slate-950">이번 주 공동창작자</h2>
            <p className="mt-2 text-sm text-slate-500">채택된 제안으로 세계관에 참여한 사람들입니다.</p>
          </div>
          <Users className="hidden size-5 text-slate-400 sm:block" />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredContributors.map((featured) => {
            const user = getContributorUser(featured);

            return user ? <ContributorCard key={featured.userId} featured={featured} user={user} /> : null;
          })}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Link className="rounded-3xl bg-slate-50 p-6 transition hover:bg-slate-100" to="/search">
          <h2 className="text-xl font-bold text-slate-950">공동창작자로 시작</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            좋아하는 웹툰에 캐릭터, 에피소드, 설정을 제안해보세요.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-950">
            웹툰 둘러보기
            <ArrowRight className="size-4" />
          </span>
        </Link>

        <Link className="rounded-3xl bg-slate-950 p-6 text-white transition hover:bg-slate-800" to="/r/new">
          <h2 className="text-xl font-bold">원작자로 시작</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            내 웹툰 세계관을 열고 함께 만들 사람들을 만나보세요.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
            내 웹툰 등록
            <ArrowRight className="size-4" />
          </span>
        </Link>
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
