import { Badge } from '@/components/common/Badge';
import { RepositoryReadme } from '@/components/repository/RepositoryReadme';
import type { Repository } from '@/features/repository/repository.types';
import { WORK_SCALE_LABELS } from '@/lib/constants';

type StepPreviewProps = {
  repository: Repository;
};

export const StepPreview = ({ repository }: StepPreviewProps) => {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <img alt="" className="h-56 w-full object-cover" loading="lazy" src={repository.thumbnail} />
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            <Badge tone="blue">{repository.genre}</Badge>
            <Badge tone="slate">{WORK_SCALE_LABELS[repository.workScale]}</Badge>
            {repository.tags.map((tag) => (
              <Badge key={tag} tone="default">
                #{tag}
              </Badge>
            ))}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">{repository.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{repository.description}</p>
        </div>
      </section>

      <RepositoryReadme repository={repository} />
    </div>
  );
};
