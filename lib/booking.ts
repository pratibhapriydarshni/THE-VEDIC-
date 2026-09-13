export const IST = 'Asia/Kolkata';
export const WORKING_HOURS: Record<number, { start: string; end: string }[]> = {
  0: [{ start: '18:00', end: '23:00' }],
  1: [{ start: '18:00', end: '23:00' }],
  2: [{ start: '18:00', end: '23:00' }],
  3: [{ start: '10:00', end: '22:00' }],
  4: [{ start: '18:00', end: '23:00' }],
  5: [{ start: '18:00', end: '23:00' }],
  6: [{ start: '18:00', end: '23:00' }],
};

export function localParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: IST, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date);
  return Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
}

export function isSameIstDay(a: Date, b = new Date()) {
  const x = localParts(a), y = localParts(b);
  return x.year === y.year && x.month === y.month && x.day === y.day;
}

export function fitsWorkingHours(start: Date, durationMinutes: number) {
  const p = localParts(start);
  const weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday);
  const minutes = Number(p.hour) * 60 + Number(p.minute);
  const endMinutes = minutes + durationMinutes;
  return (WORKING_HOURS[weekday] || []).some(w => {
    const [sh, sm] = w.start.split(':').map(Number);
    const [eh, em] = w.end.split(':').map(Number);
    return minutes >= sh * 60 + sm && endMinutes <= eh * 60 + em;
  });
}

export function isValidTenMinuteSlot(start: Date) {
  const p = localParts(start);
  return Number(p.minute) % 10 === 0;
}
