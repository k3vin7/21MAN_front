import { Badge } from '@/components/common/Badge';
import type { RecruitingArea } from '@/features/repository/repository.types';
import { RECRUITING_AREA_LABELS, RECRUITING_STATUS_LABELS } from '@/lib/constants';

type RecruitingAreaCardProps = {
  area: RecruitingArea;
};

export const RecruitingAreaCard = ({ area }: RecruitingAreaCardProps) => {
  return (
    <article className="rounded-2xl bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={area.status === 'ACTIVELY_RECRUITING' ? 'teal' : 'slate'}>
          {RECRUITING_STATUS_LABELS[area.status]}
        </Badge>
        <Badge tone="blue">{RECRUITING_AREA_LABELS[area.type]}</Badge>
      </div>
      {area.description && (
        <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{area.description}</p>
      )}
    </article>
  );
};
