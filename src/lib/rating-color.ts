// One rating palette shared by every view: 1 red → 5/6 yellow → 10 green.
// HSL interpolation keeps intermediate scores consistent across the app.
export function ratingColor(rating: number): string {
  const score = Number.isFinite(rating) ? Math.min(10, Math.max(1, rating)) : 1;
  const hue = ((score - 1) / 9) * 120;
  return `hsl(${hue.toFixed(1)} 85% 52%)`;
}
