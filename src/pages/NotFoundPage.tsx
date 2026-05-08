import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="surface-panel mx-auto max-w-3xl p-8 text-center sm:p-12">
      <div className="mx-auto flex size-14 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-accent-300">
        <Compass className="size-6" />
      </div>
      <p className="eyebrow mt-6">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">찾을 수 없는 경로입니다</h1>
      <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
        아직 구현되지 않은 주소이거나 잘못된 링크일 수 있습니다. 홈이나 검색 화면으로 돌아가서
        다른 세계관 흐름을 이어가세요.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          className="rounded-full bg-accent-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-400"
          to="/"
        >
          홈으로 이동
        </Link>
        <Link
          className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/5"
          to="/search"
        >
          검색으로 이동
        </Link>
      </div>
    </div>
  );
};
