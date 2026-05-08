import { Link } from 'react-router-dom';

const footerLinks = [
  { to: '/search', label: '레포지토리 탐색' },
  { to: '/r/new', label: '새 세계관 열기' },
  { to: '/u/ink-mason', label: '크리에이터 프로필' },
];

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="shell flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">WorldBuild</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            원작자와 컨트리뷰터가 하나의 세계관을 함께 다듬는 공동창작 플랫폼.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          {footerLinks.map((link) => (
            <Link key={link.to} className="hover:text-slate-200" to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

