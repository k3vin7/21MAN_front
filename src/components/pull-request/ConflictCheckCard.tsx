import { AlertTriangle, CheckCircle2, CircleHelp } from 'lucide-react';
import type { PullRequest } from '@/features/pull-request/pullRequest.types';
import type { Repository } from '@/features/repository/repository.types';
import { CONFLICT_RISK_LABELS } from '@/lib/constants';

type ConflictCheckCardProps = {
  pullRequest: PullRequest;
  repository?: Repository | null;
};

const riskStyle = {
  HIGH: 'bg-rose-50 text-rose-700',
  MEDIUM: 'bg-amber-50 text-amber-700',
  LOW: 'bg-slate-100 text-slate-700',
} as const;

export const ConflictCheckCard = ({ pullRequest, repository }: ConflictCheckCardProps) => {
  const risk = pullRequest.structuredContent.conflictRisk;
  const overlapsForbidden = repository?.readme.forbiddenSettings.some((setting) =>
    pullRequest.originalContent.includes(setting),
  );

  const checks = [
    {
      label: '금지 설정과 충돌 없음',
      passed: !overlapsForbidden,
      icon: overlapsForbidden ? AlertTriangle : CheckCircle2,
    },
    {
      label: '기존 캐릭터 설정과 모순 없음',
      passed: risk !== 'HIGH',
      icon: risk === 'HIGH' ? AlertTriangle : CheckCircle2,
    },
    {
      label: '기존 컨셉과 겹침 가능성',
      passed: risk === 'LOW',
      icon: risk === 'LOW' ? CheckCircle2 : CircleHelp,
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">세계관이랑 안 맞는 건 없어요?</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${riskStyle[risk]}`}>
          충돌 위험 {CONFLICT_RISK_LABELS[risk]}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {checks.map((check) => {
          const Icon = check.icon;
          return (
            <div key={check.label} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <Icon className={`size-4 shrink-0 ${check.passed ? 'text-slate-500' : 'text-amber-500'}`} />
              <p className="text-sm font-medium text-slate-700">{check.label}</p>
            </div>
          );
        })}
      </div>

      {risk !== 'LOW' && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
          관련 인물·장소·기존 규칙과의 차이를 조금 더 구체적으로 써주면 작가님이 검토하기 훨씬 편해요.
        </p>
      )}
    </section>
  );
};
