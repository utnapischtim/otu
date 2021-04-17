import { Segment, Point } from "geometric";
import type { MotorcyclePoint } from "./MotorcyclePoint";

export class MotorcycleSegment extends Segment {
  public intersections: Array<MotorcyclePoint> = [];
  public velocity: number = 0;
  public isClosed: boolean = false;

  public constructor(s: Point, t: Point, v: number = 0) {
    super(s, t);
    this.velocity = v;
  }
}
