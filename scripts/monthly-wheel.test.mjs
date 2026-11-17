import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMonthlySegments, monthlyTargetRotation, monthlySegmentAtPointer, verifiedMonthlyLanding, pointerAngleFromPoints, MONTHLY_POINTER_TIP } from '../src/monthlyWheel.ts';

test('every weighted entry lands at the blade tip, including tiny and unequal sectors', () => {
  let checked = 0;
  for (const counts of [[1], [1, 1], [1, 2, 7], [99999, 1, 1], Array(1000).fill(1), Array.from({length: 173}, (_, i) => i % 13 + 1)]) {
    const segments = buildMonthlySegments(counts.map((count, i) => ({ name: `Player ${i}`, count })));
    assert.equal(segments.at(-1).endAngle, 360);
    for (const segment of segments) {
      for (const pointerAngle of [0, 13.75, 90, 180, 359.999]) {
        const rotation = monthlyTargetRotation(segment, pointerAngle);
        assert.equal(monthlySegmentAtPointer(segments, rotation, pointerAngle)?.name, segment.name);
        assert.equal(verifiedMonthlyLanding(segments, rotation % 360, pointerAngle, segment.name)?.name, segment.name);
        checked++;
      }
    }
  }
  assert.ok(checked > 5800);
});

test('an incorrect offset or a still-moving wheel cannot announce the selected name', () => {
  const segments = buildMonthlySegments([{name:'Ana',count:1},{name:'Bruno',count:3},{name:'Carla',count:2}]);
  for (const segment of segments) {
    const target = monthlyTargetRotation(segment);
    assert.equal(verifiedMonthlyLanding(segments, target - 3, 0, segment.name), null);
    assert.equal(verifiedMonthlyLanding(segments, target, 90, segment.name), null);
    assert.equal(verifiedMonthlyLanding(segments, target, 0, 'Wrong name'), null);
  }
});

test('boundaries are deterministic and 0/360 wrap selects the same sector', () => {
  const segments = buildMonthlySegments([{name:'Ana',count:1},{name:'Bruno',count:1}]);
  assert.equal(monthlySegmentAtPointer(segments, 0, 0)?.name, 'Ana');
  assert.equal(monthlySegmentAtPointer(segments, 360, 0)?.name, 'Ana');
  assert.equal(monthlySegmentAtPointer(segments, -180, 0)?.name, 'Bruno');
  assert.equal(monthlySegmentAtPointer(segments, 0.0001, 0)?.name, 'Bruno');
});

test('the calibrated image tip stays exactly on 12 o’clock at different wheel sizes and locations', () => {
  for (const size of [320, 480, 620, 735, 940]) {
    for (const center of [{x:200,y:300},{x:960,y:540},{x:1720,y:720}]) {
      const width = size * .55, height = width * 1.5;
      const imageLeft = center.x - width * MONTHLY_POINTER_TIP.x / MONTHLY_POINTER_TIP.width;
      const imageTop = center.y - height * .58;
      const tip = {x:imageLeft + width * MONTHLY_POINTER_TIP.x / MONTHLY_POINTER_TIP.width, y:imageTop + height * MONTHLY_POINTER_TIP.y / MONTHLY_POINTER_TIP.height};
      assert.ok(Math.abs(tip.x - center.x) < 1e-9);
      assert.ok(tip.y < center.y);
      assert.equal(pointerAngleFromPoints(center, tip), 0);
    }
  }
});
