<script lang="ts">
  import { Button } from 'smelte';
  import { saveAs } from 'file-saver';

  export let polygonActive = [];

  // i thought this could be done with reactivity, but i can't get it work
  // let polygon;
  // polygonActive.subscribe(value => polygon = value);

  $: polygon = polygonActive.map(p => { return {x: p[0], y: p[1]}; });

  function handleClick(event) {
    const output = {polygon};
    const file = new Blob([JSON.stringify(output)], {type: "application/json"});

    saveAs(file, "out.json");
  }
</script>

<Button color="red" on:click={handleClick}>Save</Button>
