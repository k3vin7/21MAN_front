import { FolderPlus, Link2, ScrollText } from 'lucide-react';

const steps = [
  {
    title: '기본 정보',
    description: '세계관 이름, 장르, 짧은 소개를 입력하는 단계',
    icon: FolderPlus,
  },
  {
    title: '외부 링크와 README',
    description: '참고 자료와 기여 가이드를 정리하는 단계',
    icon: Link2,
  },
  {
    title: '모집 영역과 라이선스',
    description: '기여 가능한 영역과 저작권 관련 안내를 설정하는 단계',
    icon: ScrollText,
  },
];

export const NewRepositoryPage = () => {
  return (
    <div className="space-y-6">
      <section className="surface-panel p-6 sm:p-8">
        <p className="eyebrow">New Repository</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">새 세계관 열기</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
          멀티 스텝 생성 폼은 이후 페이즈에서 구현됩니다. 현재는 생성 페이지 진입 라우트와 안내
          레이아웃을 먼저 준비해두었습니다.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <article key={step.title} className="surface-panel p-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-accent-300">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-white">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{step.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
};

