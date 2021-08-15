import * as geom from "geometric";
import { MotorcycleSegment } from "./MotorcycleSegment";
import { MotorcyclePoint } from "./MotorcyclePoint";

export class MotorcycleGraph {
  public polygon: geom.Segment[] = [];
  public positionInfo: any;
  public motorcycleSegments: MotorcycleSegment[] = [];
  public motorcycleFullSegments: MotorcycleSegment[] = [];
  public intersectionPoints: MotorcyclePoint[] = [];

  public constructor(points: geom.IPoint[], positionInfo: any) {
    this.positionInfo = positionInfo;
    this.polygon = this.createPolygon(points);
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


  private createPolygon(points: geom.IPoint[]) {
    let polygon: geom.ISegment[] = [];
    points = geom.close(points);

    for (let k = 0; k < points.length-1; k += 1) {
      polygon.push(new geom.Segment(points[k], points[k+1]));
    }
    return polygon;
  }

  private getWidthHeight() {
    return [this.positionInfo.width, this.positionInfo.height];
  }

  private motorcycle(segA: geom.ISegment, segB: geom.ISegment, text=""): MotorcycleSegment {
    let bisector = geom.angleBisector(segA, segB).invert();
    let [width, height] = this.getWidthHeight();
    let scaleFactor = Math.sqrt(width*width + height*height) / bisector.norm();

    bisector.scale(scaleFactor);

    let start = segA.t.clone();
    let target = start.add(bisector);

    const alpha = 2*Math.PI - geom.angleToRadians(geom.segmentAngleSegment(segA, segB));
    const velocity = 1 / Math.sin(alpha/2);

    const motorcycle = new MotorcycleSegment(start, target);

    for (const segment of this.polygon) {
      if (!geom.sharePoint(motorcycle, segment)) {
        try {
          target = <geom.IPoint>geom.intersection(motorcycle, segment);
          motorcycle.setTarget(target);
        } catch (e) {
          // console.log(e);
        }
      }
    }

    return new MotorcycleSegment(start, target, velocity, text);
  }

  public calculateMotorcycleGraph(segments: MotorcycleSegment[]): void {
    this.motorcycleSegments = segments;

    this.calculateMotorcycleSegmentIntersections();
    this.buildMotorcycleGraph();
  }

  public calculateMotorcycleSegments(): void {
    const size = this.polygon.length;
    let motorcycleCounter = 0;

    for (let i = 0; i < size-1; i += 1) {
      if (geom.isReflex(this.polygon[i], this.polygon[i+1])) {
        this.motorcycleFullSegments.push(this.motorcycle(this.polygon[i], this.polygon[i+1], `${motorcycleCounter++}`));
      }
    }

    if (geom.isReflex(this.polygon[size - 1], this.polygon[0])) {
      this.motorcycleFullSegments.push(this.motorcycle(this.polygon[size - 1], this.polygon[0], `${motorcycleCounter++}`));
    }
  }

  private calculateMotorcycleSegmentIntersections(): void {
    const time = (s: geom.IPoint, e: geom.IPoint, v: number) => {
      const dist = geom.distance(s, e);
      return dist / v;
    }

    for (const segA of this.motorcycleSegments) {
      for (const segB of this.motorcycleSegments) {
        if (segA.notEqual(segB)) {
          try {
            const inter: geom.IPoint = <geom.IPoint>geom.intersection(segA, segB);

            const segATime: number = time(segA.s, inter, segA.velocity);
            const segBTime: number = time(segB.s, inter, segB.velocity);

            const pointA: MotorcyclePoint = MotorcyclePoint.fromPoint(inter);
            pointA.time = segATime;
            pointA.lostMotorcycle = segATime < segBTime ? segB : segA;
            pointA.winMotorcycle = segATime < segBTime ? segA : segB;

            const pointB: MotorcyclePoint = MotorcyclePoint.fromPoint(inter);
            pointB.time = segBTime
            pointB.lostMotorcycle = segATime < segBTime ? segB : segA;
            pointB.winMotorcycle = segATime < segBTime ? segA : segB;

            if (segATime < segBTime) {
              pointA.state = "win";
              pointB.state = "lost";
            } else {
              pointA.state = "lost";
              pointB.state = "win";
            }

            this.add(pointA);
            this.add(pointB);
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
      if (inter.state == "win") {
        inter.lostMotorcycle.winTimes[inter.winMotorcycle.text] = inter.time;
      }

      if (inter.state == "lost") {
        if (inter.winMotorcycle.isAlive && inter.lostMotorcycle.isAlive) {
          inter.lostMotorcycle.setTarget(inter, inter.time)
        }

        else if (!inter.winMotorcycle.isAlive && inter.lostMotorcycle.isAlive) {
          if (inter.lostMotorcycle.winTimes[inter.winMotorcycle.text] < inter.winMotorcycle.timeOfDeath) {
            inter.lostMotorcycle.setTarget(inter, inter.time)
          }
        }
      }
    }
  }

  public addSegments(segment: MotorcycleSegment) {
    this.motorcycleSegments.push(segment);
  }

  public getSegments() {
    return this.motorcycleSegments;
  }

  public getMotorcycleSegments() {
    return this.motorcycleFullSegments;
  }
}
