import { create } from 'zustand';
import type {
  Repository,
  RepositorySearchFilters,
} from '@/features/repository/repository.types';
import { repositoryService } from '@/features/repository/repository.service';

type RepositoryState = {
  repositories: Repository[];
  featuredRepositories: Repository[];
  selectedRepository: Repository | null;
  filters: RepositorySearchFilters;
  isLoading: boolean;
  error: string | null;
  setFilters: (filters: RepositorySearchFilters) => void;
  resetFilters: () => void;
  fetchRepositories: (filters?: RepositorySearchFilters) => Promise<void>;
  fetchFeaturedRepositories: () => Promise<void>;
  fetchRepositoryById: (repositoryId: string) => Promise<Repository | null>;
  createRepository: (repository: Repository) => Promise<Repository | null>;
  selectRepository: (repository: Repository | null) => void;
};

const initialFilters: RepositorySearchFilters = {
  sort: 'RECOMMENDED',
};

export const useRepositoryStore = create<RepositoryState>((set, get) => ({
  repositories: [],
  featuredRepositories: [],
  selectedRepository: null,
  filters: initialFilters,
  isLoading: false,
  error: null,

  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  fetchRepositories: async (filters) => {
    const nextFilters = filters ?? get().filters;
    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const repositories = await repositoryService.getRepositories(nextFilters);
      set({ repositories, isLoading: false });
    } catch {
      set({ error: '레포지토리를 불러오지 못했습니다.', isLoading: false });
    }
  },

  fetchFeaturedRepositories: async () => {
    set({ isLoading: true, error: null });

    try {
      const featuredRepositories = await repositoryService.getFeaturedRepositories();
      set({ featuredRepositories, isLoading: false });
    } catch {
      set({ error: '추천 레포지토리를 불러오지 못했습니다.', isLoading: false });
    }
  },

  fetchRepositoryById: async (repositoryId) => {
    set({ isLoading: true, error: null });

    try {
      const selectedRepository = await repositoryService.getRepositoryById(repositoryId);
      set({ selectedRepository, isLoading: false });
      return selectedRepository;
    } catch {
      set({ error: '레포지토리 상세 정보를 불러오지 못했습니다.', isLoading: false });
      return null;
    }
  },

  createRepository: async (repository) => {
    set({ isLoading: true, error: null });

    try {
      const createdRepository = await repositoryService.createRepository(repository);
      set((state) => ({
        repositories: [createdRepository, ...state.repositories.filter((item) => item.id !== createdRepository.id)],
        selectedRepository: createdRepository,
        isLoading: false,
      }));
      return createdRepository;
    } catch {
      set({ error: '레포지토리를 생성하지 못했습니다.', isLoading: false });
      return null;
    }
  },

  selectRepository: (repository) => {
    set({ selectedRepository: repository });
  },
}));
