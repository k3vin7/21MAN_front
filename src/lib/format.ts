export const formatPercent = (value: number) => {
  return `${Math.round(value)}%`;
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ko-KR').format(value);
};

export const formatReviewDays = (value: number) => {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}일`;
};

export const truncateText = (value: string, maxLength = 80) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
};

export const compactNumber = (value: number) => {
  return new Intl.NumberFormat('ko-KR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

