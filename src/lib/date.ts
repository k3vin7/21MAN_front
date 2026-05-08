const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const relativeFormatter = new Intl.RelativeTimeFormat('ko-KR', {
  numeric: 'auto',
});

export const formatDate = (value: string | Date) => {
  return dateFormatter.format(new Date(value));
};

export const formatDateTime = (value: string | Date) => {
  return dateTimeFormatter.format(new Date(value));
};

export const daysBetween = (from: string | Date, to: string | Date = new Date()) => {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();

  return Math.round((end - start) / (1000 * 60 * 60 * 24));
};

export const formatRelativeTime = (value: string | Date, base: string | Date = new Date()) => {
  const diffInDays = daysBetween(base, value);

  if (Math.abs(diffInDays) < 1) {
    return '오늘';
  }

  if (Math.abs(diffInDays) < 30) {
    return relativeFormatter.format(diffInDays, 'day');
  }

  const diffInMonths = Math.round(diffInDays / 30);
  return relativeFormatter.format(diffInMonths, 'month');
};

