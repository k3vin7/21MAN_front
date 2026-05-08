import { LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react';
import { NavLink, Outlet, useParams } from 'react-router-dom';

const dashboardSections = [
  {
    icon: ShieldCheck,
    label: '검토 대기열',
    description: 'AI 분석과 작성자 판단을 한 화면에서 이어갑니다.',
  },
  {
    icon: Sparkles,
    label: '등급 보정',
    description: '기여 등급과 머지 정책을 일관되게 관리합니다.',
  },
];

export const DashboardLayout = () => {
  const { repoId } = useParams();

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="surface-panel h-fit p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-accent-400/30 bg-accent-500/10 p-3 text-accent-200">
            <LayoutDashboard className="size-5" />
          </div>
          <div>
            <p className="eyebrow">Author Space</p>
            <h1 className="mt-2 text-lg font-semibold text-slate-950">{repoId}</h1>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {dashboardSections.map((section) => {
            const Icon = section.icon;

            return (
              <div key={section.label} className="surface-muted p-4">
                <div className="flex items-center gap-3">
                  <Icon className="size-4 text-accent-700" />
                  <p className="font-medium text-slate-900">{section.label}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{section.description}</p>
              </div>
            );
          })}
        </div>

        <NavLink
          className="mt-6 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-accent-300 hover:text-slate-950"
          to={`/r/${repoId}`}
        >
          레포지토리 상세로 돌아가기
        </NavLink>
      </aside>

      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
};
