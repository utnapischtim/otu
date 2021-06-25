<script lang="ts">
  import PolygonMenu from "./PolygonMenu.svelte";
  import Polygon from "./Polygon.svelte";

  let motorcycles = [];
  let motorcyclesCustomList = [];
</script>

<style>
  .polygon-container {
    float: right;
    width: auto;
    height: 700px;
  }
</style>

<div class="polygon-container">
  <Polygon bind:motorcycles={motorcycles} bind:motorcyclesCustomList={motorcyclesCustomList} />
  <PolygonMenu bind:motorcycles={motorcycles} bind:motorcyclesCustomList={motorcyclesCustomList} />
</div>
