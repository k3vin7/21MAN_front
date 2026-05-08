import type {
  Achievement,
  FeaturedContributor,
  ProfileActivity,
  User,
} from '@/features/user/user.types';
import { achievementsMock, profileActivitiesMock } from '@/mocks/activities.mock';
import { featuredContributorsMock, usersMock } from '@/mocks/users.mock';
import { apiClient, isApiEnabled } from '@/lib/apiClient';
import { mapApiUser } from '@/lib/apiMappers';
import { API_PATHS } from '@/lib/apiPaths';
import { cloneMock, mockDelay } from '@/lib/mock';

const AUTH_USER_KEY = 'worldbuild:auth-user';

const withApiFallback = async <T>(apiCall: () => Promise<T>, mockCall: () => Promise<T>) => {
  if (!isApiEnabled) {
    return mockCall();
  }

  try {
    return await apiCall();
  } catch (error) {
    console.warn('Falling back to user mock service.', error);
    return mockCall();
  }
};

const getMockUserById = async (userId: string) => {
  await mockDelay();
  const user = usersMock.find((item) => item.id === userId || item.username === userId);

  return user ? cloneMock(user) : null;
};

const getMockUserByUsername = async (username: string) => {
  await mockDelay();
  const user = usersMock.find((item) => item.username === username);

  return user ? cloneMock(user) : null;
};

const readStoredAuthUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const value = window.localStorage.getItem(AUTH_USER_KEY);
    if (!value) {
      return null;
    }

    const user = JSON.parse(value) as {
      id: number | string;
      username: string;
      avatar?: string;
      bio?: string;
    };

    return {
      id: String(user.id),
      username: user.username,
      displayName: user.username,
      avatar: user.avatar ?? `https://api.dicebear.com/9.x/notionists/svg?seed=${user.username}`,
      bio: user.bio ?? '',
      roles: ['AUTHOR', 'CONTRIBUTOR'],
      stats: {
        repositoriesOwned: 0,
        contributionsTotal: 0,
        majorMerges: 0,
        normalMerges: 0,
        minorMerges: 0,
        mergeRate: 0,
      },
    };
  } catch {
    return null;
  }
};

const getApiUserByUsername = async (username: string) => {
  const [user, contributorStats, authorStats] = await Promise.all([
    apiClient.get<Record<string, unknown>>(API_PATHS.users.detail(username), undefined, { auth: false }),
    apiClient
      .get<Record<string, unknown>>(API_PATHS.users.contributorStats(username), undefined, { auth: false })
      .catch(() => null),
    apiClient
      .get<Record<string, unknown>>(API_PATHS.users.authorStats(username), undefined, { auth: false })
      .catch(() => null),
  ]);

  return mapApiUser({
    ...user,
    ...contributorStats,
    ...authorStats,
    repository_count: authorStats?.repository_count,
    total_prs: contributorStats?.total_prs,
  });
};

const getApiCurrentUserProfile = async () => {
  const user = await apiClient.get<Record<string, unknown>>(API_PATHS.auth.me);
  const username = typeof user.username === 'string' ? user.username : '';

  if (!username) {
    return mapApiUser(user);
  }

  const [contributorStats, authorStats] = await Promise.all([
    apiClient
      .get<Record<string, unknown>>(API_PATHS.users.contributorStats(username), undefined, { auth: false })
      .catch(() => null),
    apiClient
      .get<Record<string, unknown>>(API_PATHS.users.authorStats(username), undefined, { auth: false })
      .catch(() => null),
  ]);

  return mapApiUser({
    ...user,
    ...contributorStats,
    ...authorStats,
    repository_count: authorStats?.repository_count,
    total_prs: contributorStats?.total_prs,
  });
};

export const userService = {
  async getUsers(): Promise<User[]> {
    await mockDelay();
    return cloneMock(usersMock);
  },

  async getUserById(userId: string): Promise<User | null> {
    return withApiFallback<User | null>(
      () => getApiUserByUsername(userId),
      () => getMockUserById(userId),
    );
  },

  async getUserByUsername(username: string): Promise<User | null> {
    return withApiFallback<User | null>(
      () => getApiUserByUsername(username),
      () => getMockUserByUsername(username),
    );
  },

  async getCurrentUserProfile(): Promise<User | null> {
    return withApiFallback<User | null>(
      () => getApiCurrentUserProfile(),
      async () => {
        await mockDelay();
        return readStoredAuthUser();
      },
    );
  },

  async getFeaturedContributors(): Promise<FeaturedContributor[]> {
    await mockDelay();
    return cloneMock(featuredContributorsMock);
  },

  async getProfileActivities(userId: string): Promise<ProfileActivity[]> {
    await mockDelay();
    return cloneMock(profileActivitiesMock.filter((activity) => activity.userId === userId));
  },

  async getAchievements(userId: string): Promise<Achievement[]> {
    await mockDelay();
    return cloneMock(achievementsMock.filter((achievement) => achievement.userId === userId));
  },
};
