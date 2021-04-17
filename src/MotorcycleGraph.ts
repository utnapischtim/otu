import { Segment, Point, close, isReflex, angleBisector, intersection, sharePoint, distance, segmentAngleSegment, angleToRadians } from "geometric";
import { MotorcycleSegment } from "./MotorcycleSegment";
import { MotorcyclePoint } from "./MotorcyclePoint";

export class MotorcycleGraph {
  public polygon: Array<Segment>;
  public positionInfo: any;
  public motorcycleSegments: Array<MotorcycleSegment> = [];
  public intersectionPoints: Array<MotorcyclePoint> = [];

  public constructor(points: Array<Point>, positionInfo: any) {
    this.polygon = this.createPolygon(points);
    this.positionInfo = positionInfo;
    this.calculateMotorcycleGraph();
  }

  public add(intersection: MotorcyclePoint): void {
    let isExisting = false;

    for (const inter of this.intersectionPoints) {
      isExisting = isExisting || inter.equal(intersection);
    }

    if (!isExisting) {
      this.intersectionPoints.push(intersection);
    }
  }


  private createPolygon(points: Array<Point>) {
    let polygon: Array<Segment> = [];
    points = close(points);

    for (let k = 0; k < points.length-1; k += 1) {
      polygon.push(new Segment(points[k], points[k+1]));
    }
    return polygon;
  }

  private getWidthHeight() {
    return [this.positionInfo.width, this.positionInfo.height];
  }

  private motorcycle(segA: Segment, segB: Segment): Segment {
    let bisector = angleBisector(segA, segB).invert();
    let [width, height] = this.getWidthHeight();
    let scaleFactor = Math.sqrt(width*width + height*height) / bisector.norm();

    bisector.scale(scaleFactor);

    let start = segA.t.clone();
    let target = start.add(bisector);

    const alpha = 2*Math.PI - angleToRadians(segmentAngleSegment(segA, segB)),
          velocity = 1 / Math.sin(alpha/2);

    return new MotorcycleSegment(start, target, velocity);
  }

  private calculateMotorcycleGraph(): void {
    this.calculateMotorcycleSegments();
    this.calculateMotorcycleSegmentIntersections();
    this.buildMotorcycleGraph();
  }

  private calculateMotorcycleSegments(): void {
    for (let i = 0; i < this.polygon.length-2; i += 1) {
      if (isReflex(this.polygon[i], this.polygon[i+1])) {
        this.motorcycleSegments.push(this.motorcycle(this.polygon[i], this.polygon[i+1]));
      }
    }
  }

  private calculateMotorcycleSegmentIntersections(): void {
    const time = (s, e, v) => {
      const dist = distance(s, e);
      return dist / v;
    }

    for (const segA of this.motorcycleSegments) {
      for (const segB of this.motorcycleSegments) {
        if (segA.notEqual(segB)) {
          try {
            const inter: Point = intersection(segA, segB),
                  lostPoint: MotorcyclePoint = MotorcyclePoint.fromPoint(inter);

            const segATime: number = time(segA.s, inter, segA.velocity),
                  segBTime: number = time(segB.s, inter, segB.velocity);

            lostPoint.time = segATime < segBTime ? segBTime : segATime;;
            lostPoint.lostMotorcycle = segATime < segBTime ? segB : segA;
            lostPoint.winMotorcycle = segATime < segBTime ? segA : segB;

            this.add(lostPoint);
          } catch (e) {
            //console.log(e);
          }
        }
      }
    }
  }

  private buildMotorcycleGraph() {
    this.intersectionPoints.sort((a, b) => a.time - b.time);

    for (const inter of this.intersectionPoints) {
      if (!inter.lostMotorcycle.isClosed && !inter.winMotorcycle.isClosed) {
        inter.lostMotorcycle.t = inter;
        inter.lostMotorcycle.isClosed = true;
      }
    }

    for (const segA of this.motorcycleSegments) {
      for (const segB of this.polygon) {
        if (!sharePoint(segA, segB)) {
          try {
            const inter = intersection(segA, segB);
            segA.t = inter;
          } catch (e) {
            // console.log(e);
          }
        }
      }
    }
  }

  public getSegments() {
    return this.motorcycleSegments;
  }

}
