import type {
  Repository,
  RepositorySearchFilters,
  RecruitingAreaType,
} from '@/features/repository/repository.types';
import type { MergeHistoryEntry, PullRequest } from '@/features/pull-request/pullRequest.types';
import type { User } from '@/features/user/user.types';
import { mergeHistoryMock } from '@/mocks/activities.mock';
import { pullRequestsMock } from '@/mocks/pullRequests.mock';
import { repositoriesMock } from '@/mocks/repositories.mock';
import { usersMock } from '@/mocks/users.mock';
import { apiClient, isApiEnabled } from '@/lib/apiClient';
import { mapApiMergeHistoryEntry, mapApiPullRequest, mapApiRepository, mapApiUser } from '@/lib/apiMappers';
import { API_PATHS } from '@/lib/apiPaths';
import { cloneMock, mockDelay } from '@/lib/mock';

let repositories = cloneMock(repositoriesMock);

type ApiListResponse = {
  items?: unknown[];
};

type ApiSearchResponse = {
  repositories?: {
    items?: unknown[];
  };
};

type ApiRepositoryStats = {
  received_prs?: number;
  merged_prs?: number;
  avg_review_days?: number;
  contributor_count?: number;
};

type ApiRepositoryDashboardResponse = {
  repository?: Record<string, unknown>;
  stats?: ApiRepositoryStats;
  pull_requests?: unknown[];
  users?: unknown[];
};

type RepositoryDashboard = {
  repository: Repository | null;
  pullRequests: PullRequest[];
  users: User[];
};

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

const getApiSort = (sort: RepositorySearchFilters['sort']) => {
  if (sort === 'POPULAR' || sort === 'MERGE_RATE' || sort === 'FAST_REVIEW' || sort === 'RECOMMENDED') {
    return 'popular';
  }

  return 'latest';
};

const getApiRecruitingArea = (type?: RecruitingAreaType) => {
  const map: Record<RecruitingAreaType, string> = {
    CHARACTER: 'character_add',
    EPISODE: 'event_episode',
    WORLD_RULE: 'worldbuilding',
    LOCATION: 'region',
    EXTRA: 'other',
    STORYBOARD: 'other',
  };

  return type ? map[type] : undefined;
};

const withApiFallback = async <T>(apiCall: () => Promise<T>, mockCall: () => Promise<T>) => {
  if (!isApiEnabled) {
    return mockCall();
  }

  try {
    return await apiCall();
  } catch (error) {
    console.warn('Falling back to repository mock service.', error);
    return mockCall();
  }
};

const writeWithApiOnly = async <T>(apiCall: () => Promise<T>, mockCall: () => Promise<T>) => {
  if (!isApiEnabled) {
    return mockCall();
  }

  return apiCall();
};

const getMockRepositories = async (filters?: RepositorySearchFilters) => {
  await mockDelay();
  const filteredRepositories = filterRepositories(repositories, filters);

  return cloneMock(sortRepositories(filteredRepositories, filters?.sort));
};

const getMockRepositoryById = async (repositoryId: string) => {
  await mockDelay();
  const repository = repositories.find((item) => item.id === repositoryId);

  return repository ? cloneMock(repository) : null;
};

const getRepositoryWithStats = async (repositoryId: string) => {
  const repository = await apiClient.get<Record<string, unknown>>(API_PATHS.repositories.detail(repositoryId), undefined, {
    auth: false,
  });
  const stats = await apiClient
    .get<ApiRepositoryStats>(API_PATHS.repositories.stats(repositoryId))
    .catch(() => null);

  return mapApiRepository({
    ...repository,
    pr_count: repository.pr_count ?? stats?.received_prs,
    merge_count: repository.merge_count ?? stats?.merged_prs,
    avg_review_days: repository.avg_review_days ?? stats?.avg_review_days,
    contributor_count: repository.contributor_count ?? stats?.contributor_count,
  });
};

const mapApiRepositoryWithStats = (
  repository: Record<string, unknown>,
  stats?: ApiRepositoryStats | null,
) => mapApiRepository({
  ...repository,
  pr_count: repository.pr_count ?? stats?.received_prs,
  merge_count: repository.merge_count ?? stats?.merged_prs,
  avg_review_days: repository.avg_review_days ?? stats?.avg_review_days,
  contributor_count: repository.contributor_count ?? stats?.contributor_count,
});

const getApiRepositoryDashboard = async (repositoryId: string): Promise<RepositoryDashboard> => {
  const response = await apiClient.get<ApiRepositoryDashboardResponse>(
    API_PATHS.repositories.dashboard(repositoryId),
  );
  const repositoryPayload = response.repository ?? {};

  return {
    repository: mapApiRepositoryWithStats(repositoryPayload, response.stats),
    pullRequests: (response.pull_requests ?? []).map((item) =>
      mapApiPullRequest({
        ...(item && typeof item === 'object' ? item : {}),
        repo_id: repositoryId,
      }),
    ),
    users: (response.users ?? []).map(mapApiUser),
  };
};

const toApiRepositoryPayload = (repository: Repository) => ({
  title: repository.title,
  description: repository.description,
  thumbnail_url: repository.thumbnail,
  tags: repository.tags,
  external_links: repository.externalLinks.map((link) => ({
    label: link.type,
    url: link.url,
  })),
  readme: {
    overview: repository.readme.worldOverview || repository.readme.intro,
    characters: repository.readme.mainCharacters.map((character) => ({
      name: character.name,
      description: character.description,
    })),
    regions: repository.readme.mainLocations.map((location) => ({
      name: location.name,
      description: location.description,
    })),
    world_rules: repository.readme.coreRules,
    forbidden_settings: repository.readme.forbiddenSettings,
  },
  recruiting_areas: repository.readme.recruitingAreas.map((area) => getApiRecruitingArea(area.type)),
  contribution_guidelines: repository.readme.contributionGuidelines,
});

export const repositoryService = {
  async getRepositories(filters?: RepositorySearchFilters): Promise<Repository[]> {
    return withApiFallback(
      async () => {
        const response = await apiClient.get<ApiListResponse>(
          API_PATHS.repositories.list,
          {
            q: filters?.query,
            tag: filters?.tag,
            recruiting: getApiRecruitingArea(filters?.recruitingAreas?.[0]),
            sort: getApiSort(filters?.sort),
            page: 1,
            size: 100,
          },
          { auth: false },
        );
        const apiRepositories = (response.items ?? []).map(mapApiRepository);
        const filteredRepositories = filterRepositories(apiRepositories, filters);

        return sortRepositories(filteredRepositories, filters?.sort);
      },
      () => getMockRepositories(filters),
    );
  },

  async searchRepositories(filters?: RepositorySearchFilters): Promise<Repository[]> {
    return withApiFallback(
      async () => {
        const response = await apiClient.get<ApiSearchResponse>(
          API_PATHS.search.global,
          {
            q: filters?.query,
            type: 'repository',
            tag: filters?.tag,
            sort: getApiSort(filters?.sort),
            page: 1,
            size: 100,
          },
          { auth: false },
        );
        const apiRepositories = (response.repositories?.items ?? []).map(mapApiRepository);
        const filteredRepositories = filterRepositories(apiRepositories, filters);

        return sortRepositories(filteredRepositories, filters?.sort);
      },
      () => getMockRepositories(filters),
    );
  },

  async getUserRepositories(username: string): Promise<Repository[]> {
    return withApiFallback(
      async () => {
        const response = await apiClient.get<ApiListResponse>(
          API_PATHS.users.repositories(username),
          { page: 1, size: 100 },
          { auth: false },
        );
        return (response.items ?? []).map((item) =>
          mapApiRepository({
            ...(item && typeof item === 'object' ? item : {}),
            author: { username },
          }),
        );
      },
      async () => {
        await mockDelay();
        const userRepos = repositories.filter(
          (repo) => repo.authorId === username,
        );
        return cloneMock(userRepos);
      },
    );
  },

  async getFeaturedRepositories(limit = 4): Promise<Repository[]> {
    return withApiFallback(
      async () => {
        const response = await apiClient.get<ApiListResponse>(
          API_PATHS.repositories.list,
          { sort: 'popular', page: 1, size: limit },
          { auth: false },
        );
        const apiRepositories = filterRepositories(
          (response.items ?? []).map(mapApiRepository),
          { recruitingOnly: true, sort: 'RECOMMENDED' },
        );

        return apiRepositories.slice(0, limit);
      },
      async () => {
        await mockDelay();
        const featured = sortRepositories(
          repositories.filter((repository) =>
            repository.readme.recruitingAreas.some((area) => area.status === 'ACTIVELY_RECRUITING'),
          ),
          'RECOMMENDED',
        );

        return cloneMock(featured.slice(0, limit));
      },
    );
  },

  async getRepositoryById(repositoryId: string): Promise<Repository | null> {
    return withApiFallback<Repository | null>(
      () => getRepositoryWithStats(repositoryId),
      () => getMockRepositoryById(repositoryId),
    );
  },

  async getRepositoryDashboard(repositoryId: string): Promise<RepositoryDashboard> {
    if (isApiEnabled) {
      return getApiRepositoryDashboard(repositoryId);
    }

    const repository = await getMockRepositoryById(repositoryId);

    return {
      repository,
      pullRequests: cloneMock(
        pullRequestsMock.filter((pullRequest) => pullRequest.repositoryId === repositoryId),
      ),
      users: cloneMock(usersMock),
    };
  },

  async createRepository(repository: Repository): Promise<Repository> {
    return writeWithApiOnly(
      async () => {
        const created = await apiClient.post<Record<string, unknown>>(
          API_PATHS.repositories.create,
          toApiRepositoryPayload(repository),
        );
        const createdId = String(created.id ?? repository.id);

        return getRepositoryWithStats(createdId).catch(() =>
          mapApiRepository({
            ...created,
            ...toApiRepositoryPayload(repository),
            id: createdId,
          }),
        );
      },
      async () => {
        await mockDelay();
        repositories = [repository, ...repositories.filter((item) => item.id !== repository.id)];

        return cloneMock(repository);
      },
    );
  },

  async getRepositoryMergeHistory(repositoryId: string): Promise<MergeHistoryEntry[]> {
    return withApiFallback(
      async () => {
        const response = await apiClient.get<ApiListResponse>(
          API_PATHS.repositories.merges(repositoryId),
          { page: 1, size: 100 },
          { auth: false },
        );

        return (response.items ?? []).map((item) => mapApiMergeHistoryEntry(item, repositoryId));
      },
      async () => {
        await mockDelay();
        const history = mergeHistoryMock.filter((entry) => entry.repositoryId === repositoryId);

        return cloneMock(history);
      },
    );
  },
};
