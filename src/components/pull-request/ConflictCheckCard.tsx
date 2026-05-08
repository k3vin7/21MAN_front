import { AlertTriangle, CheckCircle2, CircleHelp } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import type { PullRequest } from '@/features/pull-request/pullRequest.types';
import type { Repository } from '@/features/repository/repository.types';
import { CONFLICT_RISK_LABELS } from '@/lib/constants';

type ConflictCheckCardProps = {
  pullRequest: PullRequest;
  repository?: Repository | null;
};

const riskTone = {
  HIGH: 'rose',
  MEDIUM: 'amber',
  LOW: 'teal',
} as const;

export const ConflictCheckCard = ({ pullRequest, repository }: ConflictCheckCardProps) => {
  const risk = pullRequest.structuredContent.conflictRisk;
  const overlapsForbidden = repository?.readme.forbiddenSettings.some((setting) =>
    pullRequest.originalContent.includes(setting),
  );

  const checks = [
    {
      label: '금지 설정과 직접 충돌 없음',
      passed: !overlapsForbidden,
      icon: overlapsForbidden ? AlertTriangle : CheckCircle2,
    },
    {
      label: '기존 캐릭터 설정과 명백한 모순 없음',
      passed: risk !== 'HIGH',
      icon: risk === 'HIGH' ? AlertTriangle : CheckCircle2,
    },
    {
      label: '기존 컨셉과 일부 겹침 가능성 확인',
      passed: risk === 'LOW',
      icon: risk === 'LOW' ? CheckCircle2 : CircleHelp,
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">충돌 검사</h2>
          <p className="mt-1 text-sm text-slate-500">AI가 기존 세계관 문서와 창작 제안 내용을 대조한 mock 결과입니다.</p>
        </div>
        <Badge tone={riskTone[risk]}>충돌 위험 {CONFLICT_RISK_LABELS[risk]}</Badge>
      </div>

      <div className="mt-5 space-y-3">
        {checks.map((check) => {
          const Icon = check.icon;

          return (
            <div key={check.label} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <Icon className={check.passed ? 'mt-0.5 size-4 text-accent-600' : 'mt-0.5 size-4 text-amber-600'} />
              <p className="text-sm leading-6 text-slate-700">{check.label}</p>
            </div>
          );
        })}
      </div>

      {risk !== 'LOW' ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          빠진 세부 정보가 있습니다. 관련 인물, 장소, 기존 규칙과의 차이를 리뷰 전에 더 분명히 적으면
          원작자 검토가 쉬워집니다.
        </p>
      ) : null}
    </section>
  );
};
