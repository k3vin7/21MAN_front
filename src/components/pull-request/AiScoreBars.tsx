import type { PullRequest } from '@/features/pull-request/pullRequest.types';
import { cn } from '@/lib/cn';

type AiScoreBarsProps = {
  grading: PullRequest['aiGrading'];
  compact?: boolean;
};

const scoreItems = [
  { key: 'scope', label: 'Scope', description: '기여 범위' },
  { key: 'permanence', label: 'Permanence', description: '영구 반영성' },
  { key: 'cascade', label: 'Cascade', description: '후속 영향' },
  { key: 'alignment', label: 'Alignment', description: '세계관 정합성' },
  { key: 'specificity', label: 'Specificity', description: '구체성' },
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
              <span className="font-medium text-slate-200">
                {item.label}
                {!compact ? <span className="ml-2 text-xs font-normal text-slate-500">{item.description}</span> : null}
              </span>
              <span className="text-slate-400">{score}/20</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-accent-400"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

