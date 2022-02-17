<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import * as geom from "geometric";
  import * as mc from "motorcycleGraph";
  import { polygonActive, errors, reset, load, resetMotorcycles, addedToCustomList, removedFromCustomList, alterMotorcycle, labelReflexNodeOn, labelIntersectionOn, raysOn, vertexOn, isShuffled } from "../store";

  export let motorcycles = [];
  export let motorcyclesCustomList = [];

  let drawing = false, basePoint;
  let d3Points = [], g;
  let svg = d3.select("svg"); // double assignment necessary to make $: if ($reset) possible
  let isLabelOn = false;
  let isWinMotorcycleVisible = false;
  let zoomEvent, scaleFactor = 1;

  const dragger = d3.drag().on("drag", handleDrag);
  const draggerText = d3.drag().on("drag", handleDragText);

  const zoom = d3.zoom()
      .scaleExtent([0.1, 8])
      .on('zoom', function(event) {
        if (drawing) {
          return;
        }

        zoomEvent = event;
        scaleFactor = event.transform.k;

        d3.selectAll(".polygon g")
          .selectAll('polygon, circle, text, line')
          .attr('transform', event.transform);

        d3.selectAll(".polygon circle")
          .attr("r", radius(4))
          .attr("stroke-width", strokeWidth(1, false));

        d3.selectAll(".polygon text")
          .style("font-size", fontSize(15));

        d3.selectAll(".polygon line")
          .attr("stroke-width", strokeWidth(3))
          .attr("stroke-dasharray", strokeDasharray(10));
      });

  onMount(() => {
    svg = d3.select("svg"); // double assignment necessary to make $: if ($reset) possible
    svg.call(zoom);
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

    if ($labelIntersectionOn) {
      calculateIntersections($polygonActive);
    }
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
    const localCustomList = applyCustomList();

    motorcyclesCustomList = localCustomList;
    $addedToCustomList = false;
  }

  $: if ($removedFromCustomList) {
    const localCustomList = applyCustomList();

    motorcyclesCustomList = localCustomList;
    $removedFromCustomList = false;
  }

  $: if ($isShuffled) {
    const localCustomList = applyCustomList();

    setTimeout(() => {
      motorcyclesCustomList = localCustomList;
    }, 50);
    $isShuffled = false;
  }

  $: if ($labelIntersectionOn) {
    calculateIntersections($polygonActive);
  }

  $: {
    svg.selectAll("g.full text").classed("label-reflex-node-visible", $labelReflexNodeOn);
    svg.selectAll("g.intersection text").classed("label-intersection-visible", $labelIntersectionOn);
    svg.selectAll("g.full line").classed("rays-visible", $raysOn);
    svg.selectAll("g.activePolygon circle").classed("vertex-visible", $vertexOn);
  }

  function calculateIntersections(points) {
    const [width, height] = getWidthHeight();
    const pointsForMotorcycleGraph = points.map(o => geom.Point.fromArray(o));
    const motorcycles = mc.calculateMotorcycles(pointsForMotorcycleGraph, width, height);
    const intersectionCache = mc.calculateIntersectionCache(motorcycles);

    const intersections = [];
    for (const [key, inter] of Object.entries(intersectionCache)) {
      const localPointA = {
        x: inter.pointA.x,
        y: inter.pointA.y,
        time: inter.pointA.time,
        win: inter.pointA.winMotorcycle.text,
        lost: inter.pointA.lostMotorcycle.text
      };
      const localPointB = {
        x: inter.pointB.x,
        y: inter.pointB.y,
        time: inter.pointB.time,
        win: inter.pointB.winMotorcycle.text,
        lost: inter.pointB.lostMotorcycle.text
      };

      if (inter.pointA.time < inter.pointB.time) {
        intersections.push(Object.assign(localPointA, {x: localPointA.x-20, y: localPointA.y-20}));
        intersections.push(Object.assign(localPointB, {x: localPointB.x+20, y: localPointB.y+20}));
      } else {
        intersections.push(Object.assign(localPointB, {x: localPointB.x-20, y: localPointB.y-20}));
        intersections.push(Object.assign(localPointA, {x: localPointA.x+20, y: localPointA.y+20}));
      }
    }

    intersections.sort((a,b) => a.time - b.time);

    console.log(intersectionCache);

    const g = createG("intersections");
    for (let i = 0; i < intersections.length; i+=1) {
      appendText(g, intersections[i], i, {movable: true});
    }
  }

  function applyCustomList() {
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

    return localCustomList;
  }

  function resetAll() {
    scaleFactor = 1;
    zoomEvent = undefined;
    d3Points = [];
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
          pointsForMotorcycleGraph = points.map(o => geom.Point.fromArray(o));

    motorcycles = mc.calculateMotorcycles(pointsForMotorcycleGraph, positionInfo.width, positionInfo.height);
    drawMotorcycles(motorcycles);
  }

  function middleLayerDrawMotorcycleGraph(customMotorcycles) {
    if (document.querySelector(".polygon") == null || customMotorcycles.length == 0)
      return

    const motorcycleGraph = mc.calculateMotorcycleGraph(customMotorcycles);
    drawMotorcycleGraph(motorcycleGraph);
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

  function drawMotorcycleGraph(segments) {
    const gBisector = createG("bisector");
    for (const segment of segments)
      appendLine(gBisector, segment.s.toArray(), segment.t.toArray(), "solid", "#53DBF3", segment.getText());

    if (zoomEvent)
      gBisector.selectAll("line, text").attr('transform', zoomEvent.transform);
  }

  function drawMotorcycles(motorcycles) {
    const gFull = createG("full");
    for (const segment of motorcycles)
      if (!segment.isUsed)
        appendLine(gFull, segment.s.toArray(), segment.t.toArray(), "dash", "#FF5733", segment.getText());

    if (zoomEvent)
      gFull.selectAll("polygon, circle, line, text").attr('transform', zoomEvent.transform);
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

    d3Points.push(basePoint);

    if (d3Points.length > 3) {
      checkIntersections(d3Points);
    }

    // if (points.length > 2) {
    //   drawAngleBisectorOfReflexNodes(points);
    // }

    g.select("polyline").remove();

    appendPolyline(g, d3Points);

    for (let point of d3Points)
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

    if ($labelIntersectionOn) {
      calculateIntersections(newPoints);
    }
  }

  function handleDragText(event) {
    if (drawing)
      return;

    let dragText = d3.select(this);

    dragText.attr("x", event.x).attr("y", event.y);
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

    polygonActive.set(d3Points);

    drawPolygon(d3Points);
    middleLayerDrawMotorcycles(d3Points);

    if ($labelIntersectionOn) {
      calculateIntersections(d3Points);
    }

    d3Points = [];
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

  function radius(r) {
    return Math.ceil(4 / scaleFactor);
  }

  function strokeWidth(w, isCeil=false) {
    return isCeil ? Math.ceil(w / scaleFactor) : w / scaleFactor;
  }

  function strokeDasharray(a) {
    return Math.ceil(a / scaleFactor);
  }

  function fontSize(fs) {
    return `${fs / scaleFactor}px`;
  }

  function showWinningMotorcycle(event) {
    const winLine = d3.selectAll(`g.full line[data-reflex-node='${event.target.dataset.winMotorcycle}']`);
    const color = getRandomColor();

    Object.assign(event.target.style, {
      "fill": "white",
      "paint-order": "stroke",
      "stroke": color,
      "stroke-width": "3px",
      "stroke-linecap": "butt",
      "stroke-linejoin": "miter"
    });

    isWinMotorcycleVisible = !isWinMotorcycleVisible;
    winLine.classed("winning-motorcycle-visible", isWinMotorcycleVisible);
    winLine.attr("data-win-motorcycle", "w");
    winLine.style("stroke", color);
  }

  function appendCircle(g, point, option={movable: false, }) {
    const cursor = option.movable ? "move" : "pointer";

    const circle = g.append("circle")
        .attr("cx", point[0])
        .attr("cy", point[1])
        .attr("r", radius(4))
        .attr("fill", "yellow")
        .attr("stroke", "#000")
        .attr("stroke-width", strokeWidth(1, false))
        .attr("is-handle", "true")
        .attr("class", "vertex-unvisible")
        .classed("vertex-visible", $vertexOn)
        .style("cursor", cursor);

    if (option.movable)
      circle.call(dragger);
  }

  function appendText(g, point, text, option={movable: false, }) {
    const cursor = option.movable ? "move" : "pointer";
    const gText = g.append("text")
      .attr("x", point.x)
      .attr("y", point.y)
      .attr("data-win-motorcycle", point.win)
      .attr("class", "label-intersection-unvisible")
      .classed("label-intersection-visible", $labelIntersectionOn)
      .text(text);

    gText.style("cursor", cursor);

    if (option.movable)
      gText.call(draggerText);

    gText.on("click", showWinningMotorcycle);
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
      .attr("data-win-motorcycle", "")
      .attr("data-reflex-node", text.split(" ")[0])
      .attr("class", "line-win-motorcycle rays-unvisible")
      .attr("stroke", color)
      .attr("stroke-width", strokeWidth(3))
      .classed("rays-visible", $raysOn);

    if (isDashed === "dash")
      line.attr("stroke-dasharray", strokeDasharray(10));

    if (text !== "") {
      const gText = g.append("text")
        .attr("x", startPoint[0])
        .attr("y", startPoint[1])
        .attr("class", "label-reflex-node-unvisible")
        .classed("label-reflex-node-visible", $labelReflexNodeOn)
        .text(text);

      gText.on("click", (e) => alterMotorcycle.set(text));
      gText.style("font-size", fontSize(15))
      gText.call(draggerText)

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

  :global(.vertex-unvisible) {
    display: none;
  }

  :global(.vertex-visible) {
    display: unset;
  }

  :global(.rays-unvisible) {
    display: none;
  }

  :global(.rays-visible) {
    display: unset;
  }

  :global(.label-intersection-unvisible) {
    display: none;
  }

  :global(.label-intersection-visible) {
    display: block !important;
    cursor: pointer;
    font: italic 15px sans-serif
  }

  :global(.label-reflex-node-unvisible) {
    display: none;
  }

  :global(.label-reflex-node-visible) {
    display: block !important;
    cursor: pointer;
    font: italic 15px sans-serif
  }

  :global(.winning-motorcycle-unvisible) {
    display: none;
  }

  :global(.winning-motorcycle-visible) {
    stroke: blue;
  }

  :global(.line-win-motorcycle:after) {
    content: attr(data-win-motorcycle);
  }
</style>

<svg class="polygon"></svg>
