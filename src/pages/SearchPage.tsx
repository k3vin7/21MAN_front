import { type ReactNode, useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { RepoDetailModal } from '@/components/repository/RepoDetailModal';
import { RepoGrid } from '@/components/repository/RepoGrid';
import type {
  RecruitingAreaType,
  Repository,
  RepositoryBadge,
  RepositoryGenre,
  RepositorySearchFilters,
  RepositorySortOption,
  WorkScale,
} from '@/features/repository/repository.types';
import { repositoryService } from '@/features/repository/repository.service';
import type { User } from '@/features/user/user.types';
import { userService } from '@/features/user/user.service';
import {
  GENRES,
  RECRUITING_AREA_LABELS,
  REPOSITORY_SORT_LABELS,
} from '@/lib/constants';

const recruitingAreaOptions: RecruitingAreaType[] = [
  'CHARACTER',
  'LOCATION',
  'EPISODE',
  'EXTRA',
  'STORYBOARD',
];

const authorActivityOptions: Array<{ label: string; badge: RepositoryBadge }> = [
  { label: '활발한 작가', badge: 'ACTIVE_AUTHOR' },
  { label: '신생 작가', badge: 'NEW' },
  { label: '검토 빠름', badge: 'FAST_REVIEW' },
];

const workScaleOptions: Array<{ label: string; value: WorkScale }> = [
  { label: '신생', value: 'SHORT' },
  { label: '성장', value: 'MEDIUM' },
  { label: '성숙', value: 'LONG' },
];

const sortOptions: RepositorySortOption[] = ['RECOMMENDED', 'RECENT', 'MERGE_RATE', 'NEW_FIRST', 'FAST_REVIEW'];

const hasBadge = (filters: RepositorySearchFilters, badge: RepositoryBadge) => {
  return Boolean(filters.badges?.includes(badge));
};

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

  const toggleBadge = (badge: RepositoryBadge) => {
    toggleArrayFilter<RepositoryBadge>('badges', badge);
  };

  const resetFilters = () => {
    setFilters({
      query: urlQuery,
      tag: urlTag,
      sort: 'RECOMMENDED',
    });
  };

  const activeQuery = filters.query || filters.tag;
  const activeFilterCount = [
    filters.genres?.length ?? 0,
    filters.recruitingAreas?.length ?? 0,
    filters.badges?.length ?? 0,
    filters.workScales?.length ?? 0,
    filters.minMergeRate ? 1 : 0,
    filters.recruitingOnly ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-5">
      <section className="min-w-0 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-accent-700">
              {activeQuery ? `"${activeQuery}" 검색 결과` : '전체 세계관'}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">세계관 탐색</h1>
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
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-accent-600" />
                <h2 className="text-base font-semibold text-slate-950">상세 필터</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={resetFilters} size="sm" variant="ghost">
                  초기화
                </Button>
                <Button
                  aria-label="필터 닫기"
                  leftIcon={<X className="size-4" />}
                  onClick={() => setIsFilterOpen(false)}
                  size="icon"
                  variant="ghost"
                >
                  닫기
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              <FilterGroup title="장르">
                {GENRES.map((genre) => (
                  <FilterCheckbox
                    key={genre}
                    checked={Boolean(filters.genres?.includes(genre))}
                    label={genre}
                    onChange={() => toggleArrayFilter<RepositoryGenre>('genres', genre)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="모집 영역">
                {recruitingAreaOptions.map((area) => (
                  <FilterCheckbox
                    key={area}
                    checked={Boolean(filters.recruitingAreas?.includes(area))}
                    label={RECRUITING_AREA_LABELS[area]}
                    onChange={() => toggleArrayFilter<RecruitingAreaType>('recruitingAreas', area)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="원작자 활동">
                {authorActivityOptions.map((option) => (
                  <FilterCheckbox
                    key={option.badge}
                    checked={hasBadge(filters, option.badge)}
                    label={option.label}
                    onChange={() => toggleBadge(option.badge)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="공식 반영률">
                {[0, 10, 30].map((rate) => (
                  <FilterRadio
                    key={rate}
                    checked={(filters.minMergeRate ?? 0) === rate}
                    label={rate === 0 ? '전체' : `${rate}% 이상`}
                    onChange={() => setFilters((current) => ({ ...current, minMergeRate: rate || undefined }))}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="작품 규모">
                {workScaleOptions.map((option) => (
                  <FilterCheckbox
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

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              setFilters((current) => ({
                ...current,
                sort: current.sort === 'NEW_FIRST' ? 'RECOMMENDED' : 'NEW_FIRST',
                badges: hasBadge(current, 'NEW') ? current.badges?.filter((badge) => badge !== 'NEW') : [...(current.badges ?? []), 'NEW'],
              }))
            }
            size="sm"
            variant={hasBadge(filters, 'NEW') ? 'primary' : 'secondary'}
          >
            신생작 우선
          </Button>
          <Button
            onClick={() => setFilters((current) => ({ ...current, recruitingOnly: !current.recruitingOnly }))}
            size="sm"
            variant={filters.recruitingOnly ? 'primary' : 'secondary'}
          >
            모집중
          </Button>
          <Button
            onClick={() =>
              setFilters((current) => ({
                ...current,
                sort: current.sort === 'FAST_REVIEW' ? 'RECOMMENDED' : 'FAST_REVIEW',
                badges: hasBadge(current, 'FAST_REVIEW')
                  ? current.badges?.filter((badge) => badge !== 'FAST_REVIEW')
                  : [...(current.badges ?? []), 'FAST_REVIEW'],
              }))
            }
            size="sm"
            variant={hasBadge(filters, 'FAST_REVIEW') ? 'primary' : 'secondary'}
          >
            검토 빠름
          </Button>
        </div>

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
    <fieldset>
      <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</legend>
      <div className="mt-3 space-y-2">{children}</div>
    </fieldset>
  );
};

type FilterInputProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

const FilterCheckbox = ({ label, checked, onChange }: FilterInputProps) => {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
      <input
        checked={checked}
        className="size-4 rounded border-slate-300 bg-white text-accent-600 focus:ring-accent-500"
        onChange={onChange}
        type="checkbox"
      />
      {label}
    </label>
  );
};

const FilterRadio = ({ label, checked, onChange }: FilterInputProps) => {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
      <input
        checked={checked}
        className="size-4 border-slate-300 bg-white text-accent-600 focus:ring-accent-500"
        onChange={onChange}
        name="merge-rate"
        type="radio"
      />
      {label}
    </label>
  );
};
