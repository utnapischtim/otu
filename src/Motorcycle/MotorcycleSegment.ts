import * as geom from "geometric";
import type { MotorcyclePoint } from "./MotorcyclePoint";

export class MotorcycleSegment extends geom.Segment {
  public intersections: MotorcyclePoint[] = [];
  public velocity: number = 0;
  public text: string = "";
  public isClosed: boolean = false;

  public constructor(s: geom.IPoint, t: geom.IPoint, v: number = 0, text: string = "") {
    super(s, t);
    this.velocity = v;
    this.text = text;
  }

  public getText(): string {
    return this.text;
  }
}
