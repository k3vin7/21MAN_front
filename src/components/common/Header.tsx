import { FormEvent, useEffect, useState } from 'react';
import { LogOut, Search, UserRound } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/features/auth/auth.store';
import { useToast } from '@/hooks/useToast';

const navigationItems = [
  { to: '/', label: '홈' },
  { to: '/search', label: '새로운 웹툰 탐색' },
  { to: '/r/new', label: '내 웹툰 등록' },
];

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const [query, setQuery] = useState('');
  const showGlobalSearch = location.pathname !== '/';

  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      setQuery(params.get('q') ?? '');
      return;
    }

    setQuery('');
  }, [location.pathname, location.search]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextQuery = query.trim();
    navigate(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : '/search');
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: '로그아웃되었습니다.',
      tone: 'success',
    });
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="shell py-0">
        <div className="flex flex-col items-center gap-0">
          <div className="relative flex w-full flex-col items-center gap-3 py-3 lg:min-h-[4rem] lg:flex-row lg:justify-end">
            <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:gap-6">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    [
                      'rounded-xl px-4 py-2.5 text-[15px] font-semibold tracking-tight transition-all duration-150 sm:px-5',
                      isActive
                        ? 'bg-slate-950 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950',
                    ].join(' ')
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              {user ? (
                <>
                  <NavLink
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    to={`/u/${user.username}`}
                  >
                    <UserRound className="size-4" />
                    {user.username}
                  </NavLink>
                  <Button
                    isLoading={isAuthLoading}
                    leftIcon={<LogOut className="size-4" />}
                    onClick={handleLogout}
                    variant="secondary"
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <NavLink
                    className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    to="/login"
                  >
                    로그인
                  </NavLink>
                  <NavLink
                    className="inline-flex h-10 items-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                    to="/register"
                  >
                    회원가입
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {showGlobalSearch ? (
            <div className="w-full border-slate-100 px-4 py-2.5">
              <form className="mx-auto flex max-w-xl items-center gap-2" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="global-search">
                  세계관 검색
                </label>
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="global-search"
                    className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:bg-white focus:ring-2 focus:ring-slate-950/10"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="세계관, 장르, 모집 영역을 검색해보세요"
                    type="search"
                    value={query}
                  />
                </div>
                <button
                  className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  type="submit"
                >
                  검색
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
