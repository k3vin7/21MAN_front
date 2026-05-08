import { type ReactNode, useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { RepoDetailModal } from '@/components/repository/RepoDetailModal';
import { RepoGrid } from '@/components/repository/RepoGrid';
import type {
  Repository,
  RepositoryGenre,
  RepositorySearchFilters,
  RepositorySortOption,
  WorkScale,
} from '@/features/repository/repository.types';
import { repositoryService } from '@/features/repository/repository.service';
import type { User } from '@/features/user/user.types';
import { userService } from '@/features/user/user.service';
import { REPOSITORY_SORT_LABELS } from '@/lib/constants';

const genreOptions: RepositoryGenre[] = ['로맨스', '판타지', '액션', '일상', '스릴러'];

const workScaleOptions: Array<{ label: string; value: WorkScale }> = [
  { label: '신생', value: 'SHORT' },
  { label: '성장', value: 'MEDIUM' },
  { label: '성숙', value: 'LONG' },
];

const sortOptions: RepositorySortOption[] = ['RECOMMENDED', 'RECENT', 'MERGE_RATE', 'NEW_FIRST', 'FAST_REVIEW'];

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? undefined;
  const urlTag = searchParams.get('tag') ?? undefined;
  const [filters, setFilters] = useState<RepositorySearchFilters>({ sort: 'RECOMMENDED' });
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      query: urlQuery,
      tag: urlTag,
    }));
  }, [urlQuery, urlTag]);

  useEffect(() => {
    let mounted = true;

    const fetchSearchData = async () => {
      setIsLoading(true);
      const [nextRepositories, nextUsers] = await Promise.all([
        repositoryService.searchRepositories(filters),
        userService.getUsers(),
      ]);

      if (!mounted) {
        return;
      }

      setRepositories(nextRepositories);
      setUsers(nextUsers);
      setIsLoading(false);
    };

    fetchSearchData();

    return () => {
      mounted = false;
    };
  }, [filters]);

  const selectedAuthor = selectedRepository
    ? users.find((user) => user.id === selectedRepository.authorId || user.username === selectedRepository.authorId)
    : undefined;

  const toggleArrayFilter = <T extends string>(key: keyof RepositorySearchFilters, value: T) => {
    setFilters((current) => {
      const currentValues = ((current[key] as T[] | undefined) ?? []);
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...current,
        [key]: nextValues.length ? nextValues : undefined,
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      query: urlQuery,
      tag: urlTag,
      sort: 'RECOMMENDED',
    });
  };

  const activeQuery = filters.query || filters.tag;
  const activeFilterCount = (filters.genres?.length ?? 0) + (filters.workScales?.length ?? 0);

  return (
    <div className="space-y-5">
      <section className="min-w-0 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">기여 가능한 작품</h1>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              aria-expanded={isFilterOpen}
              aria-controls="search-filter-panel"
              leftIcon={<SlidersHorizontal className="size-4" />}
              onClick={() => setIsFilterOpen((value) => !value)}
              variant={isFilterOpen ? 'primary' : 'secondary'}
            >
              필터{activeFilterCount ? ` ${activeFilterCount}` : ''}
            </Button>
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/15"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sort: event.target.value as RepositorySortOption,
                }))
              }
              value={filters.sort}
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {REPOSITORY_SORT_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isFilterOpen ? (
          <div
            id="search-filter-panel"
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-slate-900">필터</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-xs font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg px-2.5 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                >
                  초기화
                </button>
                <button
                  type="button"
                  aria-label="필터 닫기"
                  onClick={() => setIsFilterOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <FilterGroup title="장르">
                {genreOptions.map((genre) => (
                  <FilterChip
                    key={genre}
                    checked={Boolean(filters.genres?.includes(genre))}
                    label={genre}
                    onChange={() => toggleArrayFilter<RepositoryGenre>('genres', genre)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="작품 규모">
                {workScaleOptions.map((option) => (
                  <FilterChip
                    key={option.value}
                    checked={Boolean(filters.workScales?.includes(option.value))}
                    label={option.label}
                    onChange={() => toggleArrayFilter<WorkScale>('workScales', option.value)}
                  />
                ))}
              </FilterGroup>
            </div>
          </div>
        ) : null}

<p className="text-sm text-slate-500">총 {repositories.length}개의 세계관을 찾았습니다.</p>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-80" />
            ))}
          </div>
        ) : repositories.length ? (
          <RepoGrid onRepoClick={setSelectedRepository} repositories={repositories} users={users} />
        ) : (
          <EmptyState
            title="못 찾으셨나요? 공동창작자로 검색해보세요."
            description="검색어나 필터를 줄이면 아직 열려 있는 세계관을 더 넓게 볼 수 있습니다."
          />
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

type FilterGroupProps = {
  title: string;
  children: ReactNode;
};

const FilterGroup = ({ title, children }: FilterGroupProps) => {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{title}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </div>
  );
};

type FilterInputProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

const FilterChip = ({ label, checked, onChange }: FilterInputProps) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        checked
          ? 'bg-slate-900 text-white'
          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );
};
