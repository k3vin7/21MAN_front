import { AlertTriangle } from 'lucide-react';
import { RecruitingAreaCard } from '@/components/repository/RecruitingAreaCard';
import type { Repository } from '@/features/repository/repository.types';

type RepositoryReadmeProps = {
  repository: Repository;
};

export const RepositoryReadme = ({ repository }: RepositoryReadmeProps) => {
  return (
    <div className="divide-y divide-slate-100">
      {repository.readme.intro && (
        <section className="py-6 first:pt-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">작품 소개</p>
          <p className="mt-3 text-base leading-8 text-slate-700">{repository.readme.intro}</p>
        </section>
      )}

      {repository.readme.worldOverview && (
        <section className="py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">이 세계는요</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{repository.readme.worldOverview}</p>
        </section>
      )}

      {repository.readme.mainCharacters.length > 0 && (
        <section className="py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">등장인물</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {repository.readme.mainCharacters.map((character) => (
              <div key={character.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">{character.name}</span>
                  <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {character.role}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{character.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {repository.readme.coreRules.length > 0 && (
        <section className="py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">이 세계의 규칙</p>
          <ol className="mt-4 space-y-3">
            {repository.readme.coreRules.map((rule, i) => (
              <li key={rule} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{rule}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {repository.readme.forbiddenSettings.length > 0 && (
        <section className="py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">이건 절대 안 돼요</p>
          <div className="mt-4 space-y-2">
            {repository.readme.forbiddenSettings.map((setting) => (
              <div key={setting} className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                {setting}
              </div>
            ))}
          </div>
        </section>
      )}

      {repository.readme.recruitingAreas.length > 0 && (
        <section className="py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">이런 분 찾아요</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {repository.readme.recruitingAreas.map((area) => (
              <RecruitingAreaCard key={area.id} area={area} />
            ))}
          </div>
        </section>
      )}

      {repository.readme.contributionGuidelines && (
        <section className="py-6 last:pb-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">같이 쓸 때 이것만요</p>
          <div className="mt-4 rounded-2xl bg-accent-50 p-5">
            <p className="text-sm leading-7 text-accent-900">
              {repository.readme.contributionGuidelines}
            </p>
          </div>
        </section>
      )}
    </div>
  );
};
