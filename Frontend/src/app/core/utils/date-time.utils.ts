export function combineDateAndTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

export function toHourLabel(dateTime: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(dateTime));
}

export function formatDateLabel(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(`${value}T00:00:00`));
}
