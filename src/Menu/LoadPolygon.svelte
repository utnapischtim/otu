<script lang="ts">
  import { Button, Dialog } from 'smelte';
  import { polygonActive, load } from "../store";

  export let filename;
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
    const px0 = polygon.reduceRight((acc, cur) => cur[0] < acc[0] ? cur : acc, pxM);
    const pyM = polygon.reduceRight((acc, cur) => acc[1] < cur[1] ? cur : acc, [0, 0]);
    const py0 = polygon.reduceRight((acc, cur) => cur[1] < acc[1] ? cur : acc, pyM);

    const rounded_px0_0 = Math.floor(px0[0]);
    const rounded_py0_1 = Math.floor(py0[1]);

    const x = pxM[0] - rounded_px0_0;
    const y = pyM[1] - rounded_py0_1;

    const scalex = width/x;
    const scaley = height/y;
    const scale = scalex < scaley ? scalex : scaley;

    const scaled_polygon = polygon.map((p) => {
      p[0] = (p[0] - rounded_px0_0) * scale;
      p[1] = (p[1] - rounded_py0_1) * scale;
      return p;
    });

    return scaled_polygon;
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
    filename = file.name;
  }
</script>

<Dialog bind:value={showDialog}>
  <h2>Choose a File</h2>
  <input type="file" use:changeFile>
</Dialog>

<Button color="red" on:click={() => showDialog = true}>Load</Button>
