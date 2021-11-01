<script lang="ts">
  import { Button, Dialog } from 'smelte';
  import { polygonActive, load } from "../store";

  export let polygons;
  let showDialog = false;

  function changeFile(node) {
    node.addEventListener("change", readFile);

    return {
      destroy() {
        node.removeEventListener("change", readFile);
      }
    };
  }

  function scale(polygon) {
    const svg = document.querySelector("svg.polygon");
    const width = svg.clientWidth;
    const height = svg.clientHeight;

    const pxM = polygon.reduceRight((acc, cur) => acc[0] < cur[0] ? cur : acc, [0, 0]);
    const px0 = polygon.reduceRight((acc, cur) => cur[0] < acc[0] ? cur : acc, pxM)
    const pyM = polygon.reduceRight((acc, cur) => acc[1] < cur[1] ? cur : acc, [0, 0]);
    const py0 = polygon.reduceRight((acc, cur) => cur[1] < acc[1] ? cur : acc, pyM);

    // plus margin does the leftmost are not on the border, so they have a padding of 10
    const margin = 10;
    const maxWidth = px0[0] + pxM[0] + 2*margin;
    const maxHeight = py0[0] + pyM[1] + 2*margin;

    if (maxWidth > width || maxHeight > height) {
      const scaleWidth = width / maxWidth;
      const scaleHeight = height / maxHeight;
      const scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight;
      const p0 = scaleWidth < scaleHeight ? pxMin : pyMin;

      polygon = polygon.map(p => {
        p[0] = (p[0] + p0[0] + margin) * scale;
        p[1] = (p[1] + p0[1] + margin) * scale;
        return p;
      });
    }

    if (maxWidth < width || maxHeight < height) {
      const scaleWidth = (width - 2*margin) / pxM[0];
      const scaleHeight = (height - 2*margin) / pyM[1];
      const scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight;

      polygon = polygon.map(p => {
        p[0] = p[0] * scale;
        p[1] = p[1] * scale;
        return p;
      });
    }

    return polygon;
  }

  function readFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const obj = JSON.parse(e.target.result);
      const polygon = scale(obj.polygon.map(p => [p.x, p.y]));
      polygonActive.set(polygon);
      load.set(true);
    };

    reader.readAsText(file);

    showDialog = false;
  }
</script>

<Dialog bind:value={showDialog}>
  <h2>Choose a File</h2>
  <input type="file" use:changeFile>
</Dialog>

<Button color="red" on:click={() => showDialog = true}>Load</Button>
