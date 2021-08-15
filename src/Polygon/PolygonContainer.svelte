<script lang="ts">
  import PolygonLollipop from "./PolygonLollipop.svelte";
  import PolygonMenu from "./PolygonMenu.svelte";
  import Polygon from "./Polygon.svelte";


  let motorcycles = [];
  let motorcyclesCustomList = [];
</script>

<style>
  .polygon-container {
    float: right;
    height: 100%;
    width: auto;
  }
</style>

<div class="polygon-container">
  <Polygon bind:motorcycles={motorcycles} bind:motorcyclesCustomList={motorcyclesCustomList} />
  <PolygonMenu bind:motorcycles={motorcycles} bind:motorcyclesCustomList={motorcyclesCustomList} />
  <PolygonLollipop bind:motorcyclesCustomList={motorcyclesCustomList} />
</div>
