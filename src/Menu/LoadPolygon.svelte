<script lang="ts">
  import { polygonActive, load } from "../store";

  export let polygons;

  function changeFile(node) {
    node.addEventListener("change", readFile);

    return {
      destroy() {
        node.removeEventListener("change", readFile);
      }
    };
  }

  function scale(polygon) {
    const xMin = Math.abs(Math.min(...polygon.map(p => p[0])));
    const yMin = Math.abs(Math.min(...polygon.map(p => p[1])));
    const xMax = Math.max(...polygon.map(p => p[0]));
    const yMax = Math.max(...polygon.map(p => p[1]));

    const svg = document.querySelector("svg.polygon");
    const width = svg.clientWidth;
    const height = svg.clientHeight;

    if (xMin > 0 && xMax < width && yMin > 0 && yMax < height)
      return polygon;

    // plus margin does the leftmost are not on the border, so they have a padding of 10
    const margin = 100;
    const maxWidth = xMin + xMax + 2*margin;
    const maxHeight = yMin + yMax + 2*margin;

    if (maxWidth > width || maxHeight > height) {
      const scaleWidth = width / maxWidth;
      const scaleHeight = height / maxHeight;
      const scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight;

      polygon = polygon.map(p => {
        p[0] = (p[0] + xMin + margin) * scale;
        p[1] = (p[1] + yMin + margin) * scale;
        return p;
      });
    }

    if (maxWidth < width || maxHeight < height) {
      let scaleHeight = 0;
      while ((++scaleHeight * (xMin+xMax) + 2*margin) < height){}

      let scaleWidth = 0;
      while ((++scaleWidth * (yMin+yMax) + 2*margin) < width){}

      const scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight;

      polygon = polygon.map(p => {
        p[0] = (p[0] + xMin) * scale + margin;
        p[1] = (p[1] + yMin) * scale + margin;
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
  }
</script>

<input type="file" use:changeFile>

