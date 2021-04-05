<script lang="ts">
  import { Button } from 'smelte';
  import { reset } from "../store";

  function handleClick(event) {
    $reset = true;
  }
</script>

<Button color="red" on:click={handleClick}>Reset</Button>
