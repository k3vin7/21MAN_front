import type {
  Repository,
  RepositorySearchFilters,
} from '@/features/repository/repository.types';
import type { MergeHistoryEntry } from '@/features/pull-request/pullRequest.types';
import { mergeHistoryMock } from '@/mocks/activities.mock';
import { repositoriesMock } from '@/mocks/repositories.mock';
import { cloneMock, mockDelay } from '@/lib/mock';

let repositories = cloneMock(repositoriesMock);

const getActivityBucket = (lastActivity: string) => {
  const diff = Date.now() - new Date(lastActivity).getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  if (days <= 7) {
    return 'ACTIVE';
  }

  if (days <= 21) {
    return 'STEADY';
  }

  return 'QUIET';
};

const filterRepositories = (repositories: Repository[], filters: RepositorySearchFilters = {}) => {
  const query = filters.query?.trim().toLowerCase();
  const tag = filters.tag?.trim();

  return repositories.filter((repository) => {
    const searchableText = [
      repository.title,
      repository.description,
      repository.genre,
      repository.readme.intro,
      repository.readme.worldOverview,
      ...repository.tags,
    ]
      .join(' ')
      .toLowerCase();

    const matchesQuery = query ? searchableText.includes(query) : true;
    const matchesTag = tag ? repository.tags.includes(tag) : true;
    const matchesGenre = filters.genres?.length ? filters.genres.includes(repository.genre) : true;
    const matchesWorkScale = filters.workScales?.length
      ? filters.workScales.includes(repository.workScale)
      : true;
    const matchesRecruitingArea = filters.recruitingAreas?.length
      ? repository.readme.recruitingAreas.some((area) => filters.recruitingAreas?.includes(area.type))
      : true;
    const matchesBadges = filters.badges?.length
      ? filters.badges.every((badge) => repository.badges.includes(badge))
      : true;
    const matchesMergeRate = filters.minMergeRate
      ? repository.stats.mergeRate >= filters.minMergeRate
      : true;
    const matchesRecruitingOnly = filters.recruitingOnly
      ? repository.readme.recruitingAreas.some((area) => area.status === 'ACTIVELY_RECRUITING')
      : true;
    const matchesAuthorActivity = filters.authorActivity
      ? getActivityBucket(repository.stats.lastActivity) === filters.authorActivity
      : true;

    return (
      matchesQuery &&
      matchesTag &&
      matchesGenre &&
      matchesWorkScale &&
      matchesRecruitingArea &&
      matchesBadges &&
      matchesMergeRate &&
      matchesRecruitingOnly &&
      matchesAuthorActivity
    );
  });
};

const sortRepositories = (repositories: Repository[], sort: RepositorySearchFilters['sort'] = 'RECOMMENDED') => {
  const sorted = [...repositories];

  switch (sort) {
    case 'RECENT':
      return sorted.sort(
        (a, b) => new Date(b.stats.lastActivity).getTime() - new Date(a.stats.lastActivity).getTime(),
      );
    case 'POPULAR':
      return sorted.sort((a, b) => b.stats.contributorCount - a.stats.contributorCount);
    case 'MERGE_RATE':
      return sorted.sort((a, b) => b.stats.mergeRate - a.stats.mergeRate);
    case 'FAST_REVIEW':
      return sorted.sort((a, b) => a.stats.avgReviewDays - b.stats.avgReviewDays);
    case 'NEW_FIRST':
      return sorted.sort((a, b) => Number(b.badges.includes('NEW')) - Number(a.badges.includes('NEW')));
    case 'RECOMMENDED':
    default:
      return sorted.sort((a, b) => {
        const aScore = a.stats.mergeRate + a.stats.contributorCount * 2 - a.stats.avgReviewDays * 4;
        const bScore = b.stats.mergeRate + b.stats.contributorCount * 2 - b.stats.avgReviewDays * 4;
        return bScore - aScore;
      });
  }
};

export const repositoryService = {
  async getRepositories(filters?: RepositorySearchFilters): Promise<Repository[]> {
    await mockDelay();
    const filteredRepositories = filterRepositories(repositories, filters);

    return cloneMock(sortRepositories(filteredRepositories, filters?.sort));
  },

  async getFeaturedRepositories(limit = 4): Promise<Repository[]> {
    await mockDelay();
    const featured = sortRepositories(
      repositories.filter((repository) =>
        repository.readme.recruitingAreas.some((area) => area.status === 'ACTIVELY_RECRUITING'),
      ),
      'RECOMMENDED',
    );

    return cloneMock(featured.slice(0, limit));
  },

  async getRepositoryById(repositoryId: string): Promise<Repository | null> {
    await mockDelay();
    const repository = repositories.find((item) => item.id === repositoryId);

    return repository ? cloneMock(repository) : null;
  },

  async createRepository(repository: Repository): Promise<Repository> {
    await mockDelay();
    repositories = [repository, ...repositories.filter((item) => item.id !== repository.id)];

    return cloneMock(repository);
  },

  async getRepositoryMergeHistory(repositoryId: string): Promise<MergeHistoryEntry[]> {
    await mockDelay();
    const history = mergeHistoryMock.filter((entry) => entry.repositoryId === repositoryId);

    return cloneMock(history);
  },
};
