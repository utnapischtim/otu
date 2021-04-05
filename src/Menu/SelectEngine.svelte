<script lang="ts">
  import { Select } from "smelte";

  export let engines = [];

  $: items = engines.map((v, i) => { return {"value": i, "text": v.item}; });

  const label = "Select the engine";
</script>

<Select {label} {items}  />
