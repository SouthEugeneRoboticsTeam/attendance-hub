export function millisToHours(milliseconds: number) {
  const seconds = (milliseconds ?? 0) / 1000;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');

  return `${hours}:${minutes}`;
}
