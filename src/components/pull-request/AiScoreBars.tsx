import type { PullRequest } from '@/features/pull-request/pullRequest.types';
import { cn } from '@/lib/cn';

type AiScoreBarsProps = {
  grading: PullRequest['aiGrading'];
  compact?: boolean;
};

const scoreItems = [
  { key: 'scope', label: '제안 범위' },
  { key: 'permanence', label: '영구 반영성' },
  { key: 'cascade', label: '후속 영향' },
  { key: 'alignment', label: '세계관 정합성' },
  { key: 'specificity', label: '구체성' },
] as const;

export const AiScoreBars = ({ grading, compact = false }: AiScoreBarsProps) => {
  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {scoreItems.map((item) => {
        const score = grading[item.key];
        const percentage = Math.min(100, (score / 20) * 100);

        return (
          <div key={item.key}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-700">{item.label}</span>
              <span className="font-bold text-slate-900">{score}<span className="text-xs font-normal text-slate-400">/20</span></span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-800"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
