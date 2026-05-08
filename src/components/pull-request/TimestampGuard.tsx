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
      label: '쓰기 시작',
      value: draftStartedAt ? new Date(draftStartedAt).toLocaleString('ko-KR') : '첫 글자 쓸 때 자동으로 찍혀요',
    },
    {
      label: '제출',
      value: submittedAt ? new Date(submittedAt).toLocaleString('ko-KR') : '제출하면 기록돼요',
    },
    {
      label: '작가님이 읽음',
      value: firstViewedByAuthorAt ? new Date(firstViewedByAuthorAt).toLocaleString('ko-KR') : '작가님이 열어보면 기록돼요',
    },
  ];

  return (
    <section className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">내 창작 기록</p>
      <p className="mt-1.5 text-sm text-slate-500">언제 썼는지 자동으로 남아요. 나중에 내 것임을 증명할 때 써요.</p>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl bg-white px-3 py-2.5">
            <p className="text-xs text-slate-400">{item.label}</p>
            <p className="mt-1 text-sm text-slate-700">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
