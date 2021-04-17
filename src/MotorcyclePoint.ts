import { Point } from "geometric";

import type { MotorcycleSegment } from "./MotorcycleSegment";

export class MotorcyclePoint extends Point {
  public time: number = 0;
  public lostMotorcycle: MotorcycleSegment;
  public winMotorcycle: MotorcycleSegment;

  public static fromPoint(p: Point): MotorcyclePoint {
    return new MotorcyclePoint(p.x, p.y);
  }
}
