import { Clock3, Eye, FilePenLine, Send } from 'lucide-react';

type TimestampGuardProps = {
  draftStartedAt?: string | null;
  submittedAt?: string | null;
  firstViewedByAuthorAt?: string | null;
};

export const TimestampGuard = ({
  draftStartedAt,
  submittedAt,
  firstViewedByAuthorAt,
}: TimestampGuardProps) => {
  const items = [
    {
      icon: FilePenLine,
      label: '작성 시작 시점',
      value: draftStartedAt ? new Date(draftStartedAt).toLocaleString('ko-KR') : '첫 입력 시 자동 기록',
    },
    {
      icon: Send,
      label: '제출 시점',
      value: submittedAt ? new Date(submittedAt).toLocaleString('ko-KR') : 'Submit 시 기록',
    },
    {
      icon: Eye,
      label: '원작자 열람 시점',
      value: firstViewedByAuthorAt ? new Date(firstViewedByAuthorAt).toLocaleString('ko-KR') : '원작자 최초 열람 시 기록',
    },
  ];

  return (
    <section className="rounded-lg border border-accent-300/20 bg-accent-300/10 p-5">
      <div className="flex items-start gap-3">
        <Clock3 className="mt-1 size-5 text-accent-200" />
        <div>
          <h2 className="font-semibold text-white">타임스탬프 보호</h2>
          <p className="mt-1 text-sm leading-6 text-accent-50/80">
            작성, 제출, 열람 로그는 도용 분쟁 시 기여 사실을 설명하는 근거로 사용할 수 있습니다.
          </p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
              <dt className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Icon className="size-3.5 text-accent-300" />
                {item.label}
              </dt>
              <dd className="mt-2 text-sm text-slate-200">{item.value}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
};

