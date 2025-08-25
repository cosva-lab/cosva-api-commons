export function isWarmupEvent(event: unknown): boolean {
  if (typeof event !== 'object' || event === null) return false;

  const e = event as { [key: string]: unknown };
  return e['source'] === 'aws.events' && e['detail-type'] === 'Scheduled Event';
}
