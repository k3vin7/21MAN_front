import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { RecruitingAreaCard } from '@/components/repository/RecruitingAreaCard';
import type { Repository } from '@/features/repository/repository.types';

type RepositoryReadmeProps = {
  repository: Repository;
};

export const RepositoryReadme = ({ repository }: RepositoryReadmeProps) => {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-white">작품 소개</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">{repository.readme.intro}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">세계관 개요</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">{repository.readme.worldOverview}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">주요 캐릭터</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {repository.readme.mainCharacters.map((character) => (
            <article key={character.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-white">{character.name}</h3>
                <Badge tone="slate">{character.role}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{character.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">주요 지역</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {repository.readme.mainLocations.map((location) => (
            <article key={location.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
              <h3 className="font-semibold text-white">{location.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{location.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">핵심 규칙</h2>
        <ul className="mt-3 grid gap-2">
          {repository.readme.coreRules.map((rule) => (
            <li key={rule} className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">금지 설정</h2>
        <div className="mt-3 grid gap-2">
          {repository.readme.forbiddenSettings.map((setting) => (
            <div key={setting} className="flex gap-3 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {setting}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">지금 받고 싶은 기여</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {repository.readme.recruitingAreas.map((area) => (
            <RecruitingAreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">기여 가이드라인</h2>
        <p className="mt-3 rounded-lg border border-white/10 bg-slate-900/60 p-4 text-sm leading-7 text-slate-300">
          {repository.readme.contributionGuidelines}
        </p>
      </section>

      <section>
        <a
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-accent-300/40 hover:text-white"
          href="https://worldbuild.example/license-policy"
          rel="noreferrer"
          target="_blank"
        >
          라이선스 정책 보기
          <ExternalLink className="size-4" />
        </a>
      </section>
    </div>
  );
};

