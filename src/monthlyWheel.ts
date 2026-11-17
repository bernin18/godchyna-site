export const MONTHLY_SPIN_DURATION_MS = 39_000;
export const MONTHLY_POINTER_IMAGE = "monthly-omega-lore-pointer.png";
// Pixel position of the blade tip in the original, unmodified 1024 × 1536 PNG.
export const MONTHLY_POINTER_TIP = { x: 567.5, y: 108.5, width: 1024, height: 1536 };

export type MonthlySegment = {
  name: string;
  count: number;
  index: number;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
  percentage: number;
  color: string;
};

export const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
export const monthlyNameKey = (name: string) => name.trim().toLocaleLowerCase();

export function buildMonthlySegments(grouped: { name: string; count: number }[]): MonthlySegment[] {
  const total = grouped.reduce((sum, entry) => sum + entry.count, 0);
  if (!total) return [];
  let cursor = 0;
  return grouped.map((entry, index) => {
    const startAngle = cursor / total * 360;
    cursor += entry.count;
    const endAngle = cursor / total * 360;
    const hue = (38 + index * 137.508) % 360;
    const lightness = index % 3 === 0 ? 42 : index % 3 === 1 ? 34 : 38;
    return {
      ...entry, index, startAngle, endAngle,
      centerAngle: (startAngle + endAngle) / 2,
      percentage: entry.count / total * 100,
      color: `hsl(${hue.toFixed(1)} 62% ${lightness}%)`,
    };
  });
}

// Conic gradients and labels both start at 12 o'clock, clockwise.
export function monthlyTargetRotation(segment: MonthlySegment, pointerAngle = 0) {
  return 6 * 360 + pointerAngle - segment.centerAngle;
}

export function pointerAngleFromPoints(center: { x: number; y: number }, tip: { x: number; y: number }) {
  return normalizeAngle(Math.atan2(tip.x - center.x, center.y - tip.y) * 180 / Math.PI);
}

export function monthlySegmentAtPointer(segments: MonthlySegment[], rotation: number, pointerAngle = 0) {
  const localAngle = normalizeAngle(pointerAngle - rotation);
  return segments.find(segment => localAngle >= segment.startAngle && localAngle < segment.endAngle) ?? null;
}

// Fail closed if the rendered pointer and the selected weighted entry ever disagree.
export function verifiedMonthlyLanding(segments: MonthlySegment[], rotation: number, pointerAngle: number, expectedName: string) {
  const segment = monthlySegmentAtPointer(segments, rotation, pointerAngle);
  if (!segment || monthlyNameKey(segment.name) !== monthlyNameKey(expectedName)) return null;
  const localAngle = normalizeAngle(pointerAngle - rotation);
  const error = Math.abs(normalizeAngle(localAngle - segment.centerAngle + 180) - 180);
  return error <= Math.min(0.05, (segment.endAngle - segment.startAngle) / 4) ? segment : null;
}
