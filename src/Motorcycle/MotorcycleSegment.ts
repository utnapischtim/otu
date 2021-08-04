import * as geom from "geometric";
import type { MotorcyclePoint } from "./MotorcyclePoint";

export class MotorcycleSegment extends geom.Segment {
  public intersections: MotorcyclePoint[] = [];
  public velocity: number = 0;
  public text: string = "";
  public isClosed: boolean = false;
  public backup: geom.IPoint[] = [];

  public constructor(s: geom.IPoint, t: geom.IPoint, v: number = 0, text: string = "") {
    super(s, t);
    this.velocity = v;
    this.text = text;

    this.doBackup();
  }

  public getText(): string {
    return this.text;
  }

  private doBackup(): void {
    this.backup.push(this.s.clone());
    this.backup.push(this.t.clone());
  }

  public reset(): void {
    this.s = this.backup[0].clone();
    this.t = this.backup[1].clone();
    this.isClosed = false;
  }
}
