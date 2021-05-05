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

  function readFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const obj = JSON.parse(e.target.result);
      polygonActive.set(obj.polygon.map(p => [p.x, p.y]));
      load.set(true);
    };
    reader.readAsText(file);
  }
</script>

<input type="file" use:changeFile>

