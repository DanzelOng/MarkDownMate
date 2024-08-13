export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-SG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}
