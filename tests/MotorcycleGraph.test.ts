import { expect, test } from '@jest/globals';
import { MotorcycleGraph } from './../src/Motorcycle/MotorcycleGraph';

test("MotorcyclePoint", () => {
  let point = new MotorcyclePoint(0, 0);

  expect(point.time).toBe(0);
});
