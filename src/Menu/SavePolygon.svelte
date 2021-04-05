<script lang="ts">
  import { Button } from 'smelte';
  import { polygons, polygonActive } from "../store";

  function handleClick(event) {
    console.log("Save Button handle click");
    console.log("handleClick polygonActive: ", $polygonActive);
  }
</script>

<Button color="red" on:click={handleClick}>Save</Button>
<div>{$polygonActive}</div>

