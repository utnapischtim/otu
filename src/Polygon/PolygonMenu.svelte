<script lang="ts">
  import { Button, Select } from "smelte";
</script>

<style>
  .polygon-menu {
    position: relative;
    top: -88%;
    border: 1px solid black;
    width: 200px;
    height: 200px;
    left: calc(100% - 205px);
  }
</style>

<div class="polygon-menu">
  <Button color="red">clone</Button>
  <Select />
</div>
