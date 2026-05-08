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
    label: '모두에게 공개',
    description: '다른 사람들도 볼 수 있어요. 원작성 증명에 더 유리해요.',
    icon: Eye,
  },
  {
    value: 'PRIVATE' as const,
    label: '작가님만',
    description: '원작자와 나만 볼 수 있어요. 타임스탬프는 그대로 남아요.',
    icon: LockKeyhole,
  },
];

export const VisibilitySelector = ({ value, onChange }: VisibilitySelectorProps) => {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">누구한테 보여줄까요?</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-2xl p-4 transition',
                selected ? 'bg-slate-900' : 'bg-slate-50 hover:bg-slate-100',
              )}
            >
              <input
                checked={selected}
                className="sr-only"
                onChange={() => onChange(option.value)}
                type="radio"
              />
              <div className="flex items-center gap-2.5">
                <Icon className={`size-4 ${selected ? 'text-white' : 'text-slate-500'}`} />
                <span className={`text-sm font-bold ${selected ? 'text-white' : 'text-slate-900'}`}>
                  {option.label}
                </span>
              </div>
              <p className={`mt-2 text-sm leading-6 ${selected ? 'text-white/70' : 'text-slate-500'}`}>
                {option.description}
              </p>
            </label>
          );
        })}
      </div>
    </section>
  );
};
