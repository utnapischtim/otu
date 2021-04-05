<script lang="ts">
  import { errors } from "../store";
</script>

{#if $errors.noSimplePolygon}
  <div>this is not a simple polygon</div>
{/if}
