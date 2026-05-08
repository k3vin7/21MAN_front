import { ShieldCheck } from 'lucide-react';
import { Textarea } from '@/components/common/Textarea';
import type { RepositoryWizardStepProps } from '@/components/forms/repositoryWizard.types';

export const REPOSITORY_LICENSE_IDS = [
  'ip-owner',
  'permanent-credit',
  'commercial-credit',
  'reject-log',
  'view-log',
];

const licenseItems = [
  {
    id: 'ip-owner',
    label: 'Merge된 기여물의 IP는 나에게 귀속됨에 동의',
  },
  {
    id: 'permanent-credit',
    label: '컨트리뷰터에게 영구 크레딧 표기 의무에 동의',
  },
  {
    id: 'commercial-credit',
    label: '외부 사업화 시 컨트리뷰터 크레딧 표기 의무에 동의',
  },
  {
    id: 'reject-log',
    label: 'Reject 사유는 영구 기록됨에 동의',
  },
  {
    id: 'view-log',
    label: '모든 PR 열람 시 자동으로 로그가 남음을 이해',
  },
];

export const StepLicense = ({ draft, updateDraft }: RepositoryWizardStepProps) => {
  const toggleAgreement = (agreementId: string) => {
    updateDraft({
      licenseAgreements: draft.licenseAgreements.includes(agreementId)
        ? draft.licenseAgreements.filter((item) => item !== agreementId)
        : [...draft.licenseAgreements, agreementId],
    });
  };

  return (
    <div className="space-y-5">
      <Textarea
        className="min-h-40"
        label="Contribution guidelines"
        onChange={(event) => updateDraft({ contributionGuidelines: event.target.value })}
        placeholder="어떤 PR이 좋은 기여인지, 검토 기준과 금지 사항을 설명해주세요."
        value={draft.contributionGuidelines}
      />

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-1 size-5 text-accent-700" />
          <div>
            <h2 className="text-lg font-semibold text-slate-950">License agreement</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              컨트리뷰터와 원작자 모두의 권리를 명확히 하기 위한 필수 동의입니다.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {licenseItems.map((item) => (
            <label key={item.id} className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
              <input
                checked={draft.licenseAgreements.includes(item.id)}
                className="size-4 rounded border-slate-300 bg-white text-accent-600 focus:ring-accent-500"
                onChange={() => toggleAgreement(item.id)}
                type="checkbox"
              />
              {item.label}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
};
