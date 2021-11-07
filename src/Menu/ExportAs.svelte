<script lang="ts">
  import { Button, Dialog } from 'smelte';
  import { saveAs } from 'file-saver';
  import * as d3 from "d3";

  let showDialog = false;

  function exportAsSVG() {
    const svg = d3.select("svg.polygon")
          .attr("title", "Polygon")
          .attr("version", 1.1)
          .attr("xmlns", "http://www.w3.org/2000/svg")
          .node()
          .outerHTML;

    const blob = new Blob([svg], {type: "image/svg+xml"});
    saveAs(blob, "exported_as_svg.svg");

    showDialog = false;
  }
</script>

<Dialog bind:value={showDialog}>
  <Button color="red" on:click={exportAsSVG}>Export As SVG</Button>
</Dialog>

<Button color="red" on:click={() => showDialog = true}>Export</Button>
