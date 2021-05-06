<script lang="ts">
  import SelectEngine from "./SelectEngine.svelte";
  import SavePolygon from "./SavePolygon.svelte";
  import LoadPolygon from "./LoadPolygon.svelte";
  import Errors from "./Errors.svelte";
  import Reset from "./Reset.svelte";
  import { engines, polygons, polygonActive } from "../store";
</script>

<style>
  .menu {
    float: right;
    width: 10%;
  }
</style>

<div class="menu">
  <SelectEngine bind:engines={$engines} />
  <SavePolygon bind:polygonActive={$polygonActive} />
  <LoadPolygon polygons />
  <Reset />
  <Errors />
</div>
