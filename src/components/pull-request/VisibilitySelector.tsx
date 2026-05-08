import { Eye, LockKeyhole } from 'lucide-react';
import type { PullRequestVisibility } from '@/features/pull-request/pullRequest.types';
import { cn } from '@/lib/cn';

type VisibilitySelectorProps = {
  value: PullRequestVisibility;
  onChange: (value: PullRequestVisibility) => void;
};

const options = [
  {
    value: 'PUBLIC' as const,
    label: 'Public',
    description: '다른 사용자가 보고 반응할 수 있습니다.',
    guide: '목격자가 많아 원작성 증명에 더 유리합니다.',
    icon: Eye,
  },
  {
    value: 'PRIVATE' as const,
    label: 'Private',
    description: '원작자와 작성자만 볼 수 있습니다.',
    guide: '목격자는 적지만 타임스탬프는 남고, Merge 이력은 공개될 수 있습니다.',
    icon: LockKeyhole,
  },
];

export const VisibilitySelector = ({ value, onChange }: VisibilitySelectorProps) => {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
      <h2 className="text-lg font-semibold text-white">공개 범위</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-lg border p-4 transition',
                selected ? 'border-accent-300/50 bg-accent-300/10' : 'border-white/10 bg-slate-950/50 hover:border-white/20',
              )}
            >
              <input
                checked={selected}
                className="sr-only"
                onChange={() => onChange(option.value)}
                type="radio"
              />
              <div className="flex items-center gap-3">
                <Icon className={selected ? 'size-5 text-accent-200' : 'size-5 text-slate-400'} />
                <span className="font-semibold text-white">{option.label}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{option.description}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{option.guide}</p>
            </label>
          );
        })}
      </div>
    </section>
  );
};

