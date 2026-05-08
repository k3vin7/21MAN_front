import { ShieldCheck } from 'lucide-react';

export const LicenseNotice = () => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-3">
        <ShieldCheck className="mt-1 size-5 text-accent-700" />
        <div>
          <h2 className="font-semibold text-slate-950">라이선스 요약</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>Merge 이후 IP는 원작자에게 귀속됩니다.</li>
            <li>컨트리뷰터의 크레딧은 프로필과 공식 기록에 영구 보장됩니다.</li>
            <li>Public PR은 더 많은 목격자가 있어 원작성 증명에 유리합니다.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
