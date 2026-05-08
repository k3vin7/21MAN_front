import { FormEvent, useEffect, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

const navigationItems = [
  { to: '/', label: '탐색' },
  { to: '/search', label: '검색' },
  { to: '/r/new', label: '새 레포지토리' },
  { to: '/u/ink-mason', label: '프로필' },
];

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Link className="flex items-center gap-3" to="/">
            <div className="rounded-2xl border border-accent-200 bg-accent-50 p-2.5 text-accent-700">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-slate-950">WorldBuild</p>
              <p className="text-sm text-slate-500">여러분의 첫 크레딧은 여기서 시작됩니다.</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  ].join(' ')
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {showGlobalSearch ? (
          <form className="flex w-full items-center gap-2 lg:max-w-md" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="global-search">
              세계관 검색
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <input
                id="global-search"
                className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/15"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="세계관, 장르, 모집 영역을 검색해보세요"
                type="search"
                value={query}
              />
            </div>
            <button
              className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="submit"
            >
              검색
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
};
