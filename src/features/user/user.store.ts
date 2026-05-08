import { create } from 'zustand';
import type {
  Achievement,
  FeaturedContributor,
  ProfileActivity,
  User,
} from '@/features/user/user.types';
import { userService } from '@/features/user/user.service';
import { MOCK_CURRENT_USER_ID } from '@/lib/constants';

type UserState = {
  users: User[];
  currentUser: User | null;
  selectedUser: User | null;
  featuredContributors: FeaturedContributor[];
  profileActivities: ProfileActivity[];
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchCurrentUser: () => Promise<User | null>;
  fetchUserByUsername: (username: string) => Promise<User | null>;
  fetchFeaturedContributors: () => Promise<void>;
  fetchProfileExtras: (userId: string) => Promise<void>;
};

export const useUserStore = create<UserState>((set) => ({
  users: [],
  currentUser: null,
  selectedUser: null,
  featuredContributors: [],
  profileActivities: [],
  achievements: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });

    try {
      const users = await userService.getUsers();
      set({ users, isLoading: false });
    } catch {
      set({ error: '사용자 목록을 불러오지 못했습니다.', isLoading: false });
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const currentUser = await userService.getUserById(MOCK_CURRENT_USER_ID);
      set({ currentUser, isLoading: false });
      return currentUser;
    } catch {
      set({ error: '현재 사용자를 불러오지 못했습니다.', isLoading: false });
      return null;
    }
  },

  fetchUserByUsername: async (username) => {
    set({ isLoading: true, error: null });

    try {
      const selectedUser = await userService.getUserByUsername(username);
      set({ selectedUser, isLoading: false });
      return selectedUser;
    } catch {
      set({ error: '프로필 정보를 불러오지 못했습니다.', isLoading: false });
      return null;
    }
  },

  fetchFeaturedContributors: async () => {
    set({ isLoading: true, error: null });

    try {
      const featuredContributors = await userService.getFeaturedContributors();
      set({ featuredContributors, isLoading: false });
    } catch {
      set({ error: '추천 공동창작자를 불러오지 못했습니다.', isLoading: false });
    }
  },

  fetchProfileExtras: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      const [profileActivities, achievements] = await Promise.all([
        userService.getProfileActivities(userId),
        userService.getAchievements(userId),
      ]);
      set({ profileActivities, achievements, isLoading: false });
    } catch {
      set({ error: '프로필 활동 정보를 불러오지 못했습니다.', isLoading: false });
    }
  },
}));
