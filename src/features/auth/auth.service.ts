import { API_PATHS } from '@/lib/apiPaths';
import { ApiError, apiClient, isApiEnabled } from '@/lib/apiClient';
import { mockDelay } from '@/lib/mock';
import type {
  AuthTokens,
  AuthUser,
  LoginRequest,
  RefreshResponse,
  RegisterRequest,
} from '@/features/auth/auth.types';

const MOCK_AUTH_USERS_KEY = 'worldbuild:mock-auth-users';
const MOCK_PASSWORDS_KEY = 'worldbuild:mock-auth-passwords';

const seededUsers: AuthUser[] = [
  {
    id: 1,
    email: 'ink-mason@example.com',
    username: 'ink-mason',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=ink-mason',
    bio: '전통 설화와 근미래 도시를 엮는 원작자입니다.',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'creator123@example.com',
    username: 'creator123',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=creator123',
    bio: '판타지 세계관을 만드는 작가입니다.',
    created_at: '2024-02-12T00:00:00Z',
  },
];

const seededPasswords: Record<string, string> = {
  'ink-mason@example.com': 'password123!',
  'creator123@example.com': 'password123!',
};

const readJson = <T>(key: string, fallback: T) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const getMockUsers = () => readJson<AuthUser[]>(MOCK_AUTH_USERS_KEY, seededUsers);

const getMockPasswords = () => readJson<Record<string, string>>(MOCK_PASSWORDS_KEY, seededPasswords);

const saveMockAuthData = (users: AuthUser[], passwords: Record<string, string>) => {
  writeJson(MOCK_AUTH_USERS_KEY, users);
  writeJson(MOCK_PASSWORDS_KEY, passwords);
};

const createToken = (prefix: 'access' | 'refresh', userId: number) => {
  return `mock-${prefix}-${userId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const createTokens = (userId: number): AuthTokens => ({
  access_token: createToken('access', userId),
  refresh_token: createToken('refresh', userId),
  token_type: 'Bearer',
});

const getUserIdFromToken = (token: string) => {
  const [, , userId] = token.split('-');
  return Number(userId);
};

const validateRegister = ({ email, password, username }: RegisterRequest) => {
  if (!email.includes('@')) {
    throw new ApiError(422, '이메일 형식이 유효하지 않습니다.', 'VALIDATION_ERROR');
  }

  if (password.length < 8) {
    throw new ApiError(422, '비밀번호는 8자 이상이어야 합니다.', 'VALIDATION_ERROR');
  }

  if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) {
    throw new ApiError(422, 'username은 영문, 숫자, 언더스코어만 사용할 수 있습니다.', 'VALIDATION_ERROR');
  }
};

export const authService = {
  async register(input: RegisterRequest): Promise<AuthUser> {
    if (isApiEnabled) {
      return apiClient.post<AuthUser>(API_PATHS.auth.register, input, { auth: false });
    }

    await mockDelay();
    validateRegister(input);

    const users = getMockUsers();
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedUsername = input.username.trim();

    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      throw new ApiError(409, '이미 사용 중인 이메일입니다.', 'EMAIL_ALREADY_EXISTS');
    }

    if (users.some((user) => user.username.toLowerCase() === normalizedUsername.toLowerCase())) {
      throw new ApiError(409, '이미 사용 중인 username입니다.', 'USERNAME_ALREADY_EXISTS');
    }

    const nextUser: AuthUser = {
      id: Math.max(...users.map((user) => user.id), 0) + 1,
      email: normalizedEmail,
      username: normalizedUsername,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(normalizedUsername)}`,
      bio: '',
      created_at: new Date().toISOString(),
    };

    saveMockAuthData([...users, nextUser], {
      ...getMockPasswords(),
      [normalizedEmail]: input.password,
    });

    return nextUser;
  },

  async login(input: LoginRequest): Promise<AuthTokens> {
    if (isApiEnabled) {
      return apiClient.post<AuthTokens>(API_PATHS.auth.login, input, { auth: false });
    }

    await mockDelay();

    const normalizedEmail = input.email.trim().toLowerCase();
    const user = getMockUsers().find((item) => item.email.toLowerCase() === normalizedEmail);
    const password = getMockPasswords()[normalizedEmail];

    if (!user || password !== input.password) {
      throw new ApiError(401, '이메일 또는 비밀번호를 확인해주세요.', 'INVALID_CREDENTIALS');
    }

    return createTokens(user.id);
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    if (isApiEnabled) {
      return apiClient.post<RefreshResponse>(API_PATHS.auth.refresh, { refresh_token: refreshToken }, { auth: false });
    }

    await mockDelay();
    const userId = getUserIdFromToken(refreshToken);

    if (!userId || !getMockUsers().some((user) => user.id === userId)) {
      throw new ApiError(401, '유효하지 않은 refresh token입니다. 다시 로그인해주세요.', 'INVALID_REFRESH_TOKEN');
    }

    return {
      access_token: createToken('access', userId),
      token_type: 'Bearer',
    };
  },

  async logout(refreshToken: string): Promise<void> {
    if (isApiEnabled) {
      await apiClient.post<void>(API_PATHS.auth.logout, { refresh_token: refreshToken });
      return;
    }

    await mockDelay();
  },

  async me(accessToken: string): Promise<AuthUser> {
    if (isApiEnabled) {
      const raw = await apiClient.get<Record<string, unknown>>(API_PATHS.auth.me);
      return {
        id: raw.id as number,
        email: String(raw.email ?? ''),
        username: String(raw.username ?? ''),
        avatar: String(raw.avatar ?? raw.avatar_url ?? ''),
        bio: raw.bio ? String(raw.bio) : undefined,
        created_at: String(raw.created_at ?? ''),
      };
    }

    await mockDelay();
    const userId = getUserIdFromToken(accessToken);
    const user = getMockUsers().find((item) => item.id === userId);

    if (!user) {
      throw new ApiError(401, '인증이 필요합니다.', 'UNAUTHORIZED');
    }

    return user;
  },
};
