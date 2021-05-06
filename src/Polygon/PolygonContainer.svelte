<script lang="ts">
  import PolygonMenu from "./PolygonMenu.svelte";
  import Polygon from "./Polygon.svelte";
</script>

<style>
  .polygon-container {
    float: right;
    width: auto;
    height: 700px;
  }
</style>

<div class="polygon-container">
  <Polygon />
  <PolygonMenu />
</div>
