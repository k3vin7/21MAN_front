type AgreementChecklistProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

const agreements = [
  {
    id: 'ip',
    label: '공식 반영 시 IP는 원작자에게 귀속돼요',
  },
  {
    id: 'credit',
    label: '기여 크레딧은 내 프로필에 영구 표기돼요',
  },
  {
    id: 'timestamp',
    label: '작성·제출·열람 시점이 영구 기록돼요',
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
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">제출 전에 확인해주세요</h2>
      <div className="mt-4 space-y-3">
        {agreements.map((agreement) => (
          <label key={agreement.id} className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            <input
              checked={value.includes(agreement.id)}
              className="size-4 rounded border-slate-300 bg-white text-slate-900 focus:ring-slate-500"
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
