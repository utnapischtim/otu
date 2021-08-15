<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";

  export let motorcyclesCustomList = [];



  let svg = d3.select(".lollipop");
  let g, xAxisG, yAxisG;


  const width = 300;
  const height = 150;
  const margin = { left: 40, right: 10, top: 10, bottom: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xValue = d => d.reflexNodeNumber;
  const xLabel = "reflex nodes";
  const yValue = d => d.recalculationCount;
  const yLabel = "recalculation count";

  const xScale = d3.scaleBand().padding(0.95);
  const yScale = d3.scaleLinear();

  const xAxis = d3.axisBottom()
        .scale(xScale)
        .tickPadding(15)
        .tickSize(-innerHeight);

  const yTicks = 2;
  const yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(yTicks)
        .tickPadding(15)
        .tickFormat(d3.format('.0s'))
        .tickSize(-innerWidth);

  let data = [];

  $: {
    data = motorcyclesCustomList
      .map((m) => ({reflexNodeNumber: m.getNodeName(), recalculationCount: m.getReductionCounter()}))
      .filter(a => a.recalculationCount > 0)
      .sort((a, b) => a.reflexNodeNumber - b.reflexNodeNumber);

    if (data.length > 0) {
      drawLollipops(data);
    }
  }

  onMount(() => {
    svg = d3.select(".lollipop");
    init();
  });

  function init() {
    g = svg.append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

    xAxisG = g.append("g")
          .attr("transform", `translate(0, ${innerHeight})`);

    yAxisG = g.append("g");

    xAxisG
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .text(xLabel);

    yAxisG
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', -50)
      .attr('y', -25)
      .attr('transform', `rotate(-90)`)
      .style('text-anchor', 'middle')
      .text(yLabel);
  }

  function drawLollipops(data) {
    xScale
      .domain(data.map(xValue))
      .range([0, innerWidth]);

    yScale
      .domain(d3.extent(data, yValue))
      .range([innerHeight, 0])
      .nice(yTicks);

    g.selectAll('circle').data(data)
      .enter().append('circle')
      .attr('cx', d => xScale(xValue(d)) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(yValue(d)))
      .attr('fill', 'black')
      .attr('fill-opacity', 0.6)
      .attr('r', 8);

    g.selectAll('rect').data(data)
      .enter().append('rect')
      .attr('x', d => xScale(xValue(d)))
      .attr('y', d => yScale(yValue(d)))
      .attr('width', d => xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(yValue(d)))
      .attr('fill', 'black')
      .attr('fill-opacity', 0.6);

    xAxisG.call(xAxis);
    yAxisG.call(yAxis);
  }
</script>

<style>
  .lollipop {
    border: 1px solid black;
    position: absolute;
    right: 320px;
    top: 15px;
  }

  :global(.axis-label) {
    fill: #635F5D;
    font-size: 10pt;
    font-family: sans-serif;
  }
</style>

<svg class="lollipop"></svg>
