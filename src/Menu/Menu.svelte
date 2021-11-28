<script lang="ts">
  import SelectEngine from "./SelectEngine.svelte";
  import SavePolygon from "./SavePolygon.svelte";
  import LoadPolygon from "./LoadPolygon.svelte";
  import ExportAs from "./ExportAs.svelte";
  import Errors from "./Errors.svelte";
  import Reset from "./Reset.svelte";
  import { engines, polygons, polygonActive } from "../store";

  let filename = "";
</script>

<style>
  .menu {
    padding: 10px;
  }

  hr {
    border: 1px solid #ccc8c8;
    display: inline;
    margin: 0px 10px;
    transform: rotate(90deg);
  }

  .filename {
    color: #a8a2a2;
  }
</style>

<div class="menu">
  <!-- <SelectEngine bind:engines={$engines} /> -->
  <SavePolygon bind:polygonActive={$polygonActive} />
  <Reset />
  <LoadPolygon bind:filename={filename} />
  <ExportAs />
  <Errors />

  <hr />

  <span class="filename">Filename: {filename}</span>
</div>
