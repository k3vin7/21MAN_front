import { FormEvent, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const navigationItems = [
  { to: '/', label: '탐색' },
  { to: '/search', label: '검색' },
  { to: '/r/new', label: '세계관 등록' },
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
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="shell py-0">
        <div className="flex flex-col items-center gap-0">
          <nav className="flex w-full items-center justify-center gap-1 py-3">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-6 py-2.5 text-[15px] font-semibold tracking-tight transition-all duration-150',
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

          {showGlobalSearch ? (
            <div className="w-full border-t border-slate-100 px-4 py-2.5">
              <form className="mx-auto flex max-w-xl items-center gap-2" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="global-search">
                  세계관 검색
                </label>
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="global-search"
                    className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/15"
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
