<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import * as geom from "geometric";
  import { polygonActive, errors, reset, load, resetMotorcycles, addedToCustomList, removedFromCustomList, alterMotorcycle } from "../store";
  import { MotorcycleGraph } from "../Motorcycle";

  export let motorcycles = [];
  export let motorcyclesCustomList = [];

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
    resetAll();
    $reset = false;
  }

  $: if ($load) {
    resetAll();
    deleteMotorcycles();
    drawPolygon($polygonActive);
    middleLayerDrawMotorcycles($polygonActive);
    load.set(false);
  }

  $: if ($resetMotorcycles) {
    for (const segment of motorcycles) {
      segment.reset();
      segment.resetReductionCounter();
    }

    deleteMotorcycles();
    drawMotorcycles(motorcycles);
    $resetMotorcycles = false;
  }

  $: if ($addedToCustomList) {
    let localCustomList = [];

    for (const motorcycle of motorcycles) {
      motorcycle.reset();
      motorcycle.resetReductionCounter();
    }

    for (const customEntry of motorcyclesCustomList) {
      for (const motorcycle of motorcycles) {
        motorcycle.reset();
      }

      customEntry.isUsed = true;
      localCustomList.push(customEntry);
      middleLayerDrawMotorcycleGraph(localCustomList, $polygonActive);
      drawMotorcycles(motorcycles);
    }

    motorcyclesCustomList = localCustomList;
  }

  $: if ($removedFromCustomList) {
    let localCustomList = [];

    for (const motorcycle of motorcycles) {
      motorcycle.reset();
    }

    for (const customEntry of motorcyclesCustomList) {
      for (const motorcycle of motorcycles) {
        motorcycle.reset();
      }

      customEntry.isUsed = true;
      localCustomList.push(customEntry);
      middleLayerDrawMotorcycleGraph(localCustomList, $polygonActive);
      drawMotorcycles(motorcycles);
    }

    motorcyclesCustomList = localCustomList;
  }

  function resetAll() {
    points = [];
    motorcycles = [];
    motorcyclesCustomList = [];
    svg.selectAll("g").remove();
  }

  function deleteMotorcycles() {
    const bisector = svg.select("g.bisector");
    bisector.selectAll("line").remove();
    bisector.selectAll("text").remove();
  }

  function createLines(points) {
    let lines = [];

    for (let k = 0; k < points.length-1; k += 1) {
      lines.push(new geom.Line(geom.Point.fromArray(points[k]), geom.Point.fromArray(points[k+1])));
    }

    return lines;
  }

  function checkIntersections(points) {
    let lines = createLines(points);

    for (let aa of lines) {
      for (let bb of lines) {
        if (!geom.sharePoint(aa, bb) && geom.lineIntersectsLine(aa, bb)) {
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
          segA = new geom.Segment(geom.Point.fromArray(points[size-3]), geom.Point.fromArray(points[size-2])),
          segB = new geom.Segment(geom.Point.fromArray(points[size-2]), geom.Point.fromArray(points[size-1]));

    if (!geom.isReflex(segA, segB)) {
      return;
    }

    let bisector = geom.angleBisector(segA, segB).invert();
    let [width, height] = getWidthHeight();
    let scaleFactor = Math.sqrt(width*width + height*height) / bisector.norm();

    bisector.scale(scaleFactor);

    let middleNode = geom.Point.fromArray(points[size-2]);
    let target = middleNode.add(bisector);

    let g = svg.append("g").attr("class", "bisector");

    appendLine(g, [middleNode.x, middleNode.y], [target.x, target.y]);
  }

  function middleLayerDrawMotorcycles(points) {
    // this functions purpose is to convert from [x,y] to geom.Point's and to
    // verify that .polygon exists
    if (document.querySelector(".polygon") == null || points.length == 0)
      return;

    const positionInfo = document.querySelector(".polygon").getBoundingClientRect(),
          pointsForMotorcycleGraph = points.map(o => geom.Point.fromArray(o)),
          motorcycleGraph = new MotorcycleGraph(pointsForMotorcycleGraph, positionInfo);

    motorcycleGraph.calculateMotorcycleSegments();
    motorcycles = motorcycleGraph.getMotorcycleSegments();
    drawMotorcycles(motorcycles);
  }

  function middleLayerDrawMotorcycleGraph(segments, points) {
    if (document.querySelector(".polygon") != null && segments.length > 0) {
      drawMotorcycleGraph(segments, points);
    }
  }

  function createG(className) {
    let g;
    if (svg.select(`g.${className}`).empty()) {
      g = svg.append("g").attr("class", className);
    } else {
      g = svg.select(`g.${className}`);
      g.selectAll("line").remove();
      g.selectAll("text").remove();
    }
    return g;
  }

  function drawMotorcycleGraph(motorcyclesCustom, points) {
    const positionInfo = document.querySelector(".polygon").getBoundingClientRect(),
          pointsForMotorcycleGraph = points.map(o => geom.Point.fromArray(o)),
          motorcycleGraph = new MotorcycleGraph(pointsForMotorcycleGraph, positionInfo);

    motorcycleGraph.calculateMotorcycleGraph(motorcyclesCustom);

    const  segments = motorcycleGraph.getSegments();

    const gBisector = createG("bisector");
    for (const segment of segments)
      appendLine(gBisector, segment.s.toArray(), segment.t.toArray(), "solid", "#53DBF3", segment.getText());

  }

  function drawMotorcycles(motorcycles) {
    const gFull = createG("full");
    for (const segment of motorcycles)
      if (!segment.isUsed)
        appendLine(gFull, segment.s.toArray(), segment.t.toArray(), "dash", "#FF5733", segment.getText());
  }

  function actOnClick(event) {
    if (!svg.select("g.activePolygon").empty()) {
      return;
    }

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

    // TODO:
    // it has to be defined what should be done after a moved node
    // if there are motorcycles in the custom list. what should happend
    // if there are introduced new motorcycles affecting the allready
    // computed
    if (motorcyclesCustomList.length > 0) {
      alert("if motorcycles custom list has values it is not possible to move for now");
      return;
    }

    let dragCircle = d3.select(this), newPoints = [];

    let poly = d3.select(this.parentNode).select("polygon");
    let circles = d3.select(this.parentNode).selectAll("circle");

    dragCircle.attr("cx", event.x)
      .attr("cy", event.y);

    for (let circleOld of circles._groups[0]) {
      const circle = d3.select(circleOld);
      newPoints.push([parseInt(circle.attr("cx")), parseInt(circle.attr("cy"))]);
    }

    poly.attr("points", newPoints);

    polygonActive.set(newPoints);

    middleLayerDrawMotorcycles(newPoints);
  }

  function drawPolygon(points) {
    svg.select("g.activePolygon").remove();

    let g = svg.append("g").attr("class", "activePolygon");

    appendPolygon(g, points);

    for (let point of points)
      appendCircle(g, point, {movable: true});
  }


  function closePolygon() {
    svg.select("g.drawPoly").remove();

    polygonActive.set(points);

    drawPolygon(points);
    middleLayerDrawMotorcycles(points);

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

  function appendLine(g, startPoint, endPoint, isDashed="", color="#53DBF3", text="") {
    const line = g.append("line")
      .attr("x1", startPoint[0])
      .attr("y1", startPoint[1])
      .attr("x2", endPoint[0] + 2)
      .attr("y2", endPoint[1])
      .attr("stroke", color)
      .attr("stroke-width", 1);

    if (isDashed === "dash")
      line.attr("stroke-dasharray", 10);

    if (text !== "") {
      g.append("text")
        .attr("x", startPoint[0])
        .attr("y", startPoint[1])
        .attr("style", "cursor: pointer; font: italic 15px sans-serif")
        .text(text)
        .on("click", (e) => alterMotorcycle.set(text));

      line
        .attr("style", "cursor: pointer")
        .on("click", (e) => alterMotorcycle.set(text))
    }
  }

</script>

<style>
  .polygon {
    height: 100%;
    width: 100%;
  }
</style>

<svg class="polygon"></svg>
