import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  Globe2,
  GitPullRequest,
  Mic,
  PenLine,
  Plus,
  Search,
  Sparkles,
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

const quickActions = [
  {
    label: '캐릭터 모집',
    tag: '캐릭터모집',
    icon: Sparkles,
  },
  {
    label: '에피소드 제안',
    tag: '에피소드제안',
    icon: PenLine,
  },
  {
    label: '세계관 찾기',
    tag: '지역문화',
    icon: Globe2,
  },
];

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
    <div className="space-y-14">
        <img
          src={dinosaur}
          alt="공룡"
          className="absolute left-0 top-[380px] w-[700px] h-[700px] object-contain z-[0]"
        />
        <img
          src={ufo}
          alt="ufo"
          className="absolute right-5 top-10 w-[500px] h-[500px] object-contain z-[0] rotate-12"
        />
      <section className="relative min-h-[calc(100svh+12rem)]">
        <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-4xl flex-col items-center justify-center pb-28 text-center">
          <h1 className="mx-auto max-w-4xl text-3xl font-semibold text-slate-950 sm:text-5xl">
            원하는 세계관에 뛰어드세요!
          </h1>

          <form className="sticky top-24 z-10 mt-10 w-full max-w-3xl" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="home-search">
              세계관 검색
            </label>
            <div className="flex min-h-20 items-center gap-3 rounded-[2rem] border border-slate-200 bg-white px-4 py-3 text-left shadow-lg sm:rounded-full sm:px-5">
              <span
                aria-label="검색 옵션 추가"
                className="flex size-1 shrink-0 items-center justify-center rounded-full text-slate-500"
                type="button"
              >
              </span>

              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-slate-400 sm:hidden" />
                <input
                  id="home-search"
                  className="h-12 w-full bg-transparent pl-6 pr-2 text-base text-slate-950 outline-none placeholder:text-slate-400 sm:pl-0"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="세계관, 장르, 모집 영역을 검색해보세요"
                  type="search"
                  value={query}
                />
              </div>

              <button
                aria-label="검색 실행"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-slate-800"
                type="submit"
              >
                <ArrowRight className="size-5" />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.label}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm text-slate-600 shadow-sm transition hover:border-accent-300 hover:bg-accent-50 hover:text-slate-950"
                    to={`/search?tag=${encodeURIComponent(action.tag)}`}
                  >
                    <Icon className="size-4 text-accent-600" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </form>

          <div className="mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
            {RECOMMENDED_TAGS.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                className="rounded-full px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                to={`/search?tag=${encodeURIComponent(tag)}`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute left-1/2 top-[calc(100svh-18rem)] flex -translate-x-1/2 flex-col items-center gap-3 text-sm text-slate-500">
          <span>스크롤해서 모집 중인 세계관 보기</span>
          <span className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
            <ArrowDown className="size-4" />
          </span>
        </div>
      </section>

      <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent-600" />
            모집 중인 영역
          </span>
          <strong className="text-slate-950">24</strong>
        </div>
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span>이번 주 Merge</span>
          <strong className="text-slate-950">5</strong>
        </div>
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span>평균 리뷰</span>
          <strong className="text-slate-950">2.8일</strong>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">지금 기여자를 찾는 세계관</h2>
            <p className="mt-2 text-sm text-slate-500">카드를 눌러 README와 모집 영역을 먼저 훑어볼 수 있습니다.</p>
          </div>
          <Link className="hidden text-sm font-medium text-accent-700 hover:text-accent-900 sm:inline" to="/search">
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
            <h2 className="text-2xl font-semibold text-slate-950">이번 주 주목받는 컨트리뷰터</h2>
            <p className="mt-2 text-sm text-slate-500">팬이 아니라 공동창작자로 남는 사람들입니다.</p>
          </div>
          <Users className="hidden size-6 text-accent-600 sm:block" />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredContributors.map((featured) => {
            const user = getContributorUser(featured);

            return user ? <ContributorCard key={featured.userId} featured={featured} user={user} /> : null;
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <GitPullRequest className="size-6 text-accent-600" />
          <h2 className="mt-4 text-xl font-semibold text-slate-950">컨트리뷰터로 시작</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            다른 사람 세계관에 기여하면서 창작 이력을 쌓아보세요.
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-700 hover:text-accent-900"
            to="/search"
          >
            세계관 둘러보기
            <ArrowRight className="size-4" />
          </Link>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <Sparkles className="size-6 text-accent-600" />
          <h2 className="mt-4 text-xl font-semibold text-slate-950">원작자로 시작</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            내 세계관을 등록하고 함께 키워갈 동료를 만나보세요.
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-700 hover:text-accent-900"
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
