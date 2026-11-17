import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMonthlySegments, monthlyTargetRotation, monthlySegmentAtPointer, verifiedMonthlyLanding, pointerAngleFromPoints, MONTHLY_POINTER_TIP, MONTHLY_POINTER_WIDTH_RATIO, MONTHLY_POINTER_FINAL_ROTATION } from '../src/monthlyWheel.ts';
import { parseParticipantInput, MAX_MONTHLY_PARTICIPANT_MULTIPLIER } from '../src/participantEntries.ts';

test('monthly input preserves x2000 and exactly 4000 weighted entries without the daily 500 cap', () => {
  const input = 'rodrigo x2000\nRui 1000x\nAna x500\nBruno x495\nCarla x5';
  const monthly = parseParticipantInput(input, MAX_MONTHLY_PARTICIPANT_MULTIPLIER);
  assert.equal(monthly.entries.length, 4000);
  assert.equal(monthly.cappedLines, 0);
  const counts = new Map();
  for (const name of monthly.entries) counts.set(name, (counts.get(name) ?? 0) + 1);
  assert.equal(counts.get('rodrigo'), 2000);
  assert.equal(counts.get('Carla'), 5);
  const segments = buildMonthlySegments([...counts].map(([name,count]) => ({name,count})));
  assert.equal(segments[0].percentage, 50);
  assert.equal(segments.at(-1).percentage, .125);
  assert.ok(Math.abs(segments.at(-1).endAngle - segments.at(-1).startAngle - .45) < 1e-10);
  assert.equal(parseParticipantInput('rodrigo x2000').entries.length, 500);
});

test('4000-entry scenarios survive browser-like matrix rounding and subpixel pointer coordinates', () => {
  const cases = [
    [2000, 1000, 500, ...Array(45).fill(10), 45, 5],
    [5, 45, ...Array(45).fill(10), 500, 1000, 2000],
    Array(50).fill(80),
    [3755, ...Array(49).fill(5)],
  ];
  let checks = 0;
  let worstError = 0;
  for (const counts of cases) {
    assert.equal(counts.reduce((sum,n) => sum+n,0), 4000);
    const segments = buildMonthlySegments(counts.map((count,i) => ({name:`Pessoa ${i}`,count})));
    for (const size of [320,480,620,735,940]) {
      const radius = size * MONTHLY_POINTER_WIDTH_RATIO * 1.5 * (.58 - MONTHLY_POINTER_TIP.y / MONTHLY_POINTER_TIP.height);
      for (const segment of segments) {
        for (let finalAngle = -360; finalAngle < 360; finalAngle += 7) {
          const rotation = monthlyTargetRotation(segment, finalAngle);
          const radians = rotation * Math.PI / 180;
          const serializedRotation = Math.atan2(Number(Math.sin(radians).toFixed(6)), Number(Math.cos(radians).toFixed(6))) * 180 / Math.PI;
          const pointerRadians = finalAngle * Math.PI / 180;
          // Independent Cartesian projection and 1/64 CSS-pixel quantization.
          const tip = {x:Math.round((960+radius*Math.sin(pointerRadians))*64)/64,y:Math.round((540-radius*Math.cos(pointerRadians))*64)/64};
          const pointerAngle = pointerAngleFromPoints({x:960,y:540}, tip);
          const localAngle = ((pointerAngle - serializedRotation) % 360 + 360) % 360;
          const oracleIndex = counts.findIndex((_,i) => localAngle < counts.slice(0,i+1).reduce((sum,n) => sum+n,0) / 4000 * 360);
          assert.equal(oracleIndex, segment.index);
          assert.equal(verifiedMonthlyLanding(segments, serializedRotation, pointerAngle, segment.name)?.name, segment.name);
          const error = Math.abs(((localAngle-segment.centerAngle+540)%360)-180);
          worstError = Math.max(worstError, error);
          checks++;
        }
      }
    }
  }
  console.log(JSON.stringify({precisionChecks:checks,maximumAngularErrorDegrees:worstError,smallestSectorDegrees:.45}));
});

test('every weighted entry lands at the blade tip, including tiny and unequal sectors', () => {
  let checked = 0;
  for (const counts of [[1], [1, 1], [1, 2, 7], [99999, 1, 1], Array(1000).fill(1), Array.from({length: 173}, (_, i) => i % 13 + 1)]) {
    const segments = buildMonthlySegments(counts.map((count, i) => ({ name: `Player ${i}`, count })));
    assert.equal(segments.at(-1).endAngle, 360);
    for (const segment of segments) {
      for (const pointerAngle of [0, 13.75, 90, 180, 359.999, MONTHLY_POINTER_FINAL_ROTATION, 2873.25]) {
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
      const width = size * MONTHLY_POINTER_WIDTH_RATIO, height = width * 1.5;
      const imageLeft = center.x - width * MONTHLY_POINTER_TIP.x / MONTHLY_POINTER_TIP.width;
      const imageTop = center.y - height * .58;
      const tip = {x:imageLeft + width * MONTHLY_POINTER_TIP.x / MONTHLY_POINTER_TIP.width, y:imageTop + height * MONTHLY_POINTER_TIP.y / MONTHLY_POINTER_TIP.height};
      assert.ok(Math.abs(tip.x - center.x) < 1e-9);
      assert.ok(tip.y < center.y);
      assert.equal(pointerAngleFromPoints(center, tip), 0);
    }
  }
});

test('compact pointer rotations select the same sector as the physically rotated blade tip', () => {
  assert.equal(MONTHLY_POINTER_WIDTH_RATIO, .20);
  assert.ok(MONTHLY_POINTER_WIDTH_RATIO * 1.5 < .31);
  const segments = buildMonthlySegments([{name:'Ana',count:1},{name:'Bruno',count:7},{name:'Carla',count:2}]);
  for (const size of [320, 620, 940]) {
    const center = {x:960,y:540};
    const height = size * MONTHLY_POINTER_WIDTH_RATIO * 1.5;
    const offsetY = height * (MONTHLY_POINTER_TIP.y / MONTHLY_POINTER_TIP.height - .58);
    for (const angle of [0, 37, 90, 180, 270, -2880, 2873.25]) {
      const radians = angle * Math.PI / 180;
      const tip = {x:center.x - offsetY * Math.sin(radians),y:center.y + offsetY * Math.cos(radians)};
      const measuredAngle = pointerAngleFromPoints(center, tip);
      for (const segment of segments) {
        const rotation = monthlyTargetRotation(segment, angle);
        assert.equal(verifiedMonthlyLanding(segments, rotation, measuredAngle, segment.name)?.name, segment.name);
      }
    }
  }
});
