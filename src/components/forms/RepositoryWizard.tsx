import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { StepBasicInfo } from '@/components/forms/StepBasicInfo';
import { StepExternalLinks } from '@/components/forms/StepExternalLinks';
import { StepLicense, REPOSITORY_LICENSE_IDS } from '@/components/forms/StepLicense';
import { StepPreview } from '@/components/forms/StepPreview';
import { StepReadme } from '@/components/forms/StepReadme';
import { StepRecruitingAreas } from '@/components/forms/StepRecruitingAreas';
import {
  createWizardId,
  toRecruitingArea,
  type RepositoryWizardState,
} from '@/components/forms/repositoryWizard.types';
import type { Repository, WorkScale } from '@/features/repository/repository.types';
import { useRepositoryStore } from '@/features/repository/repository.store';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/useToast';
import { MOCK_AUTHOR_ID } from '@/lib/constants';

const wizardStorageKey = 'worldbuild:new-repository-wizard';

const defaultThumbnail =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';

const createInitialState = (): RepositoryWizardState => ({
  title: '',
  thumbnail: '',
  intro: '',
  description: '',
  genres: ['판타지'],
  tags: ['캐릭터모집'],
  externalLinks: [],
  worldOverview: '',
  mainCharacters: [
    {
      id: createWizardId('character'),
      name: '',
      role: '',
      description: '',
    },
  ],
  mainLocations: [
    {
      id: createWizardId('location'),
      name: '',
      description: '',
    },
  ],
  coreRulesText: '',
  forbiddenSettingsText: '',
  recruitingAreas: [
    {
      id: createWizardId('area'),
      type: 'CHARACTER',
      status: 'ACTIVELY_RECRUITING',
      difficulty: 'MEDIUM',
      description: '',
    },
  ],
  contributionGuidelines: '',
  licenseAgreements: [],
});

const steps = [
  'Basic Info',
  'External Links',
  'README',
  'Recruiting Areas',
  'Guidelines & License',
  'Preview & Publish',
];

const slugify = (value: string) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'new-world';
};

const createRepositoryId = (title: string) => {
  return `${slugify(title)}-${Date.now().toString(36)}`;
};

const lines = (value: string) => {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

export const RepositoryWizard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createRepository = useRepositoryStore((state) => state.createRepository);
  const [draft, setDraft, clearDraft] = useLocalStorage<RepositoryWizardState>(
    wizardStorageKey,
    createInitialState(),
  );
  const [activeStep, setActiveStep] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const updateDraft = (patch: Partial<RepositoryWizardState>) => {
    setDraft((current) => ({
      ...current,
      ...patch,
    }));
  };

  const previewRepository = useMemo(() => buildRepositoryFromDraft(draft), [draft]);
  const licenseComplete = REPOSITORY_LICENSE_IDS.every((id) => draft.licenseAgreements.includes(id));
  const canGoNext = validateStep(activeStep, draft);
  const canPublish = validateStep(0, draft) && validateStep(2, draft) && validateStep(3, draft) && licenseComplete;

  const handlePublish = async () => {
    if (!canPublish) {
      toast({
        title: '필수 입력을 확인해주세요',
        description: '기본 정보, README, 모집 영역, 라이선스 동의가 필요합니다.',
        tone: 'warning',
      });
      return;
    }

    setIsPublishing(true);

    try {
      const createdRepository = await createRepository(previewRepository);

      if (!createdRepository) {
        toast({
          title: '발행에 실패했습니다',
          description: '잠시 뒤 다시 시도해주세요.',
          tone: 'error',
        });
        return;
      }

      clearDraft();
      toast({
        title: '세계관이 발행되었습니다',
        description: `${createdRepository.title} 상세 페이지로 이동합니다.`,
        tone: 'success',
      });
      navigate(`/r/${createdRepository.id}`);
    } catch {
      toast({
        title: '발행에 실패했습니다',
        description: '예상치 못한 오류가 발생했습니다.',
        tone: 'error',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-700">New Repository</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">새 세계관 열기</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              단계별 입력은 localStorage에 자동 저장됩니다.
            </p>
          </div>
          <Badge tone={licenseComplete ? 'teal' : 'amber'}>
            {activeStep + 1} / {steps.length}
          </Badge>
        </div>

        <ol className="mt-5 grid gap-2 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step}>
              <button
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  activeStep === index
                    ? 'border-accent-300 bg-accent-50 text-accent-900'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950'
                }`}
                onClick={() => setActiveStep(index)}
                type="button"
              >
                <span className="mr-2 text-xs text-slate-500">{index + 1}</span>
                {step}
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        {activeStep === 0 ? <StepBasicInfo draft={draft} updateDraft={updateDraft} /> : null}
        {activeStep === 1 ? <StepExternalLinks draft={draft} updateDraft={updateDraft} /> : null}
        {activeStep === 2 ? <StepReadme draft={draft} updateDraft={updateDraft} /> : null}
        {activeStep === 3 ? <StepRecruitingAreas draft={draft} updateDraft={updateDraft} /> : null}
        {activeStep === 4 ? <StepLicense draft={draft} updateDraft={updateDraft} /> : null}
        {activeStep === 5 ? <StepPreview repository={previewRepository} /> : null}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          disabled={activeStep === 0}
          leftIcon={<ArrowLeft className="size-4" />}
          onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
          variant="secondary"
        >
          이전
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => {
              clearDraft();
              setDraft(createInitialState());
              setActiveStep(0);
            }}
            variant="ghost"
          >
            초기화
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button
              disabled={!canGoNext}
              onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}
              rightIcon={<ArrowRight className="size-4" />}
            >
              다음
            </Button>
          ) : (
            <Button
              disabled={!canPublish}
              isLoading={isPublishing}
              leftIcon={canPublish ? <Send className="size-4" /> : <CheckCircle2 className="size-4" />}
              onClick={handlePublish}
            >
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const validateStep = (step: number, draft: RepositoryWizardState) => {
  if (step === 0) {
    return Boolean(draft.title.trim() && draft.intro.trim() && draft.description.trim() && draft.genres.length);
  }

  if (step === 2) {
    return Boolean(draft.worldOverview.trim() && lines(draft.coreRulesText).length);
  }

  if (step === 3) {
    return draft.recruitingAreas.some((area) => area.description.trim());
  }

  if (step === 4) {
    return REPOSITORY_LICENSE_IDS.every((id) => draft.licenseAgreements.includes(id));
  }

  return true;
};

const buildRepositoryFromDraft = (draft: RepositoryWizardState): Repository => {
  const now = new Date().toISOString();
  const genre = draft.genres[0] ?? '판타지';
  const workScale: WorkScale = draft.worldOverview.length > 350 ? 'LONG' : draft.worldOverview.length > 160 ? 'MEDIUM' : 'SHORT';
  const coreRules = lines(draft.coreRulesText);
  const forbiddenSettings = lines(draft.forbiddenSettingsText);
  const recruitingAreas = draft.recruitingAreas
    .filter((area) => area.description.trim())
    .map(toRecruitingArea);

  return {
    id: createRepositoryId(draft.title),
    title: draft.title.trim() || '새 세계관',
    thumbnail: draft.thumbnail.trim() || defaultThumbnail,
    authorId: MOCK_AUTHOR_ID,
    description: draft.description.trim() || draft.intro.trim(),
    genre,
    workScale,
    tags: Array.from(new Set([genre, ...draft.tags.filter(Boolean)])),
    externalLinks: draft.externalLinks
      .filter((link) => link.url.trim())
      .map((link) => ({
        type: link.type,
        url: link.url,
      })),
    readme: {
      intro: draft.intro.trim() || draft.description.trim(),
      worldOverview: draft.worldOverview.trim() || draft.description.trim(),
      mainCharacters: draft.mainCharacters.filter((character) => character.name.trim()),
      mainLocations: draft.mainLocations.filter((location) => location.name.trim()),
      coreRules: coreRules.length ? coreRules : ['공식 규칙은 원작자 검토를 통해 확정됩니다.'],
      forbiddenSettings: forbiddenSettings.length ? forbiddenSettings : ['기존 설정과 직접 충돌하는 전개'],
      recruitingAreas:
        recruitingAreas.length > 0
          ? recruitingAreas
          : [
              {
                id: createWizardId('area'),
                type: 'CHARACTER',
                status: 'ACTIVELY_RECRUITING',
                difficulty: 'MEDIUM',
                description: '새 캐릭터와 관계 설정을 모집합니다.',
              },
            ],
      contributionGuidelines:
        draft.contributionGuidelines.trim() ||
        '기존 README와 금지 설정을 확인한 뒤, 제안의 영향 범위와 기대 효과를 함께 적어주세요.',
    },
    stats: {
      prCount: 0,
      mergeCount: 0,
      mergeRate: 0,
      avgReviewDays: 0,
      contributorCount: 0,
      lastActivity: now,
    },
    badges: ['NEW'],
  };
};
