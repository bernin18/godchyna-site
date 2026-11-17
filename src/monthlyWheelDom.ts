import { pointerAngleFromPoints, verifiedMonthlyLanding } from "./monthlyWheel";
import type { MonthlySegment } from "./monthlyWheel";

export function readMonthlyLanding(rotor: HTMLElement, tip: HTMLElement, segments: MonthlySegment[], expectedName: string) {
  const rect = rotor.getBoundingClientRect();
  const tipRect = tip.getBoundingClientRect();
  const transform = window.getComputedStyle(rotor).transform;
  const matrix = new DOMMatrixReadOnly(transform === "none" ? undefined : transform);
  const renderedRotation = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
  const pointerAngle = pointerAngleFromPoints(
    { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    { x: tipRect.left, y: tipRect.top },
  );
  return verifiedMonthlyLanding(segments, renderedRotation, pointerAngle, expectedName);
}
