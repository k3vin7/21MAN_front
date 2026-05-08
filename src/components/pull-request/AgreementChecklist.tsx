type AgreementChecklistProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

const agreements = [
  {
    id: 'ip',
    label: 'Merge 시 IP는 원작자에게 귀속됨에 동의',
  },
  {
    id: 'credit',
    label: '크레딧은 내 프로필에 영구 표기됨에 동의',
  },
  {
    id: 'timestamp',
    label: '작성 / 제출 / 열람 시점이 영구 기록됨에 동의',
  },
];

export const AGREEMENT_IDS = agreements.map((agreement) => agreement.id);

export const AgreementChecklist = ({ value, onChange }: AgreementChecklistProps) => {
  const toggleAgreement = (agreementId: string) => {
    onChange(
      value.includes(agreementId)
        ? value.filter((item) => item !== agreementId)
        : [...value, agreementId],
    );
  };

  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
      <h2 className="text-lg font-semibold text-white">제출 전 동의</h2>
      <div className="mt-4 space-y-3">
        {agreements.map((agreement) => (
          <label key={agreement.id} className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
            <input
              checked={value.includes(agreement.id)}
              className="size-4 rounded border-white/20 bg-slate-950 text-accent-500 focus:ring-accent-400"
              onChange={() => toggleAgreement(agreement.id)}
              type="checkbox"
            />
            {agreement.label}
          </label>
        ))}
      </div>
    </section>
  );
};

