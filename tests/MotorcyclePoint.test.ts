import { expect, test } from '@jest/globals';
import { MotorcyclePoint } from './../src/Motorcycle/MotorcyclePoint';

test("hello world test", () => {
  let point = new MotorcyclePoint(0, 0);

  expect(point.time).toBe(0);
});
