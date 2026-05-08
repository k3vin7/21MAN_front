import type {
  Achievement,
  FeaturedContributor,
  ProfileActivity,
  User,
} from '@/features/user/user.types';
import { achievementsMock, profileActivitiesMock } from '@/mocks/activities.mock';
import { featuredContributorsMock, usersMock } from '@/mocks/users.mock';
import { cloneMock, mockDelay } from '@/lib/mock';

export const userService = {
  async getUsers(): Promise<User[]> {
    await mockDelay();
    return cloneMock(usersMock);
  },

  async getUserById(userId: string): Promise<User | null> {
    await mockDelay();
    const user = usersMock.find((item) => item.id === userId);

    return user ? cloneMock(user) : null;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    await mockDelay();
    const user = usersMock.find((item) => item.username === username);

    return user ? cloneMock(user) : null;
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

