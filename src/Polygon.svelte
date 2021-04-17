<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { lineIntersectsLine, sharePoint, angleBisector, isReflex, Vector, Point, Line, Segment } from "geometric";
  import { polygonActive, errors, reset } from "./store";
  import { MotorcycleGraph } from "./MotorcycleGraph";

  let drawing = false, basePoint;
  let points = [], g;
  let svg = d3.select("svg"); // double assignment necessary to make $: if ($reset) possible
  const dragger = d3.drag().on("drag", handleDrag);

  onMount(() => {
    svg = d3.select("svg"); // double assignment necessary to make $: if ($reset) possible
    svg.on("click", actOnClick);
    svg.on("mousemove", actOnMousemove);
  });

  $: if ($reset) {
    points = [];
    svg.selectAll("g").remove();
    $reset = false;
  }

  function createLines(points) {
    let lines = [];

    for (let k = 0; k < points.length-1; k += 1) {
      lines.push(new Line(Point.fromArray(points[k]), Point.fromArray(points[k+1])));
    }

    return lines;
  }

  function checkIntersections(points) {
    let lines = createLines(points);

    for (let aa of lines) {
      for (let bb of lines) {
        if (!sharePoint(aa, bb) && lineIntersectsLine(aa, bb)) {
          $errors.noSimplePolygon = true;
        }
      }
    }
  }

  function getWidthHeight() {
    let positionInfo = document.querySelector(".polygon").getBoundingClientRect();
    return [positionInfo.width, positionInfo.height];
  }

  function drawAngleBisectorOfReflexNodes(points) {
    if (points.length < 3) {
      return;
    }

    const size = points.length,
          segA = new Segment(Point.fromArray(points[size-3]), Point.fromArray(points[size-2])),
          segB = new Segment(Point.fromArray(points[size-2]), Point.fromArray(points[size-1]));

    if (!isReflex(segA, segB)) {
      return;
    }

    let bisector = angleBisector(segA, segB).invert();
    let [width, height] = getWidthHeight();
    let scaleFactor = Math.sqrt(width*width + height*height) / bisector.norm();

    bisector.scale(scaleFactor);

    let middleNode = Point.fromArray(points[size-2]);
    let target = middleNode.add(bisector);

    let g = svg.append("g").attr("class", "bisector");

    appendLine(g, [middleNode.x, middleNode.y], [target.x, target.y]);
  }

  function drawMotorcycleGraph(points) {
    const positionInfo = document.querySelector(".polygon").getBoundingClientRect(),
          motorcycleGraph = new MotorcycleGraph(points, positionInfo),
          segments = motorcycleGraph.getSegments();

    let g = svg.append("g").attr("class", "bisector");

    for (const segment of segments)
      appendLine(g, segment.s.toArray(), segment.t.toArray());
  }

  function actOnClick(event) {
    drawing = true;

    basePoint = d3.pointer(event);

    if (svg.select("g.drawPoly").empty()) {
      g = svg.append("g").attr("class", "drawPoly");
    }

    if (event.target.hasAttribute("is-handle")) {
      closePolygon();
      return;
    }

    points.push(basePoint);

    if (points.length > 3) {
      checkIntersections(points);
    }

    // if (points.length > 2) {
    //   drawAngleBisectorOfReflexNodes(points);
    // }

    g.select("polyline").remove();

    appendPolyline(g, points);

    for (let point of points)
      appendCircle(g, point);

  }

  function actOnMousemove(event) {
    if (!drawing)
      return;

    let g = d3.select("g.drawPoly");
    g.select("line").remove();

    appendLine(g, basePoint, d3.pointer(event));
  }

  function handleDrag(event) {
    if (drawing)
      return;

    let dragCircle = d3.select(this), newPoints = [];

    let poly = d3.select(this.parentNode).select("polygon");
    let circles = d3.select(this.parentNode).selectAll("circle");

    dragCircle.attr("cx", event.x)
      .attr("cy", event.y);

    for (let circleOld of circles._groups[0]) {
      const circle = d3.select(circleOld);
      newPoints.push([circle.attr("cx"), circle.attr("cy")]);
    }

    poly.attr("points", newPoints);
  }

  function closePolygon() {
    svg.select("g.drawPoly").remove();

    let g = svg.append("g");

    appendPolygon(g, points);

    for (let point of points)
      appendCircle(g, point, {movable: true});

    polygonActive.set(points);

    drawMotorcycleGraph(points.map(o => Point.fromArray(o)));

    points = [];
    drawing = false;

  }

  function getRandomColor() {
    let letters = "0123456789ABCDEF".split("");
    let color = "#";

    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
  }


  function appendCircle(g, point, option={movable: false, }) {
    const cursor = option.movable ? "move" : "pointer";

    const circle = g.append("circle")
        .attr("cx", point[0])
        .attr("cy", point[1])
        .attr("r", 4)
        .attr("fill", "yellow")
        .attr("stroke", "#000")
        .attr("is-handle", "true")
        .style("cursor", cursor);

    if (option.movable)
      circle.call(dragger);
  }

  function appendPolyline(g, points) {
    g.append("polyline")
      .attr("points", points)
      .style("fill", "none")
      .attr("stroke", "#000");
  }

  function appendPolygon(g, points) {
    g.append("polygon")
      .attr("points", points)
      .attr("fill", "none")
      .attr("stroke", getRandomColor());
  }

  function appendLine(g, startPoint, endPoint) {
    g.append("line")
      .attr("x1", startPoint[0])
      .attr("y1", startPoint[1])
      .attr("x2", endPoint[0] + 2)
      .attr("y2", endPoint[1])
      .attr("stroke", "#53DBF3")
      .attr("stroke-width", 1);

  }

</script>

<style>
  .polygon {
    border: 1px solid black;
    width: 80%;
    height: 700px;
    float: left;
  }
</style>

<svg class="polygon"></svg>
