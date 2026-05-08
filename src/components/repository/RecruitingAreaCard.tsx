import { Badge } from '@/components/common/Badge';
import type { RecruitingArea } from '@/features/repository/repository.types';
import {
  DIFFICULTY_LABELS,
  RECRUITING_AREA_LABELS,
  RECRUITING_STATUS_LABELS,
} from '@/lib/constants';

type RecruitingAreaCardProps = {
  area: RecruitingArea;
};

export const RecruitingAreaCard = ({ area }: RecruitingAreaCardProps) => {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={area.status === 'ACTIVELY_RECRUITING' ? 'teal' : 'slate'}>
          {RECRUITING_STATUS_LABELS[area.status]}
        </Badge>
        <Badge tone="blue">{RECRUITING_AREA_LABELS[area.type]}</Badge>
        <Badge tone={area.difficulty === 'HIGH' ? 'amber' : 'default'}>
          난이도 {DIFFICULTY_LABELS[area.difficulty]}
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{area.description}</p>
    </article>
  );
};
