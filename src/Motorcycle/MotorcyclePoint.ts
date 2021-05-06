import * as geom from "geometric";

import type { MotorcycleSegment } from "./MotorcycleSegment";

export class MotorcyclePoint extends geom.Point {
  public time: number = 0;
  public lostMotorcycle!: MotorcycleSegment;
  public winMotorcycle!: MotorcycleSegment;

  public constructor(x: number, y: number) {
    super(x, y);
  }

  public static fromPoint(p: geom.IPoint): MotorcyclePoint {
    return new MotorcyclePoint(p.x, p.y);
  }
}
