<script lang="ts">
  import { Button, Select, List } from "smelte";

  export let motorcycles = [];
  export let motorcyclesCustomList = [];

  let motorcyclesOut;

  $: items = motorcycles.map((m) => { return {value: m.getText(), text: m.getText()}; });

  function chooseMotorcycle(item) {
    for (let i = 0; i < motorcycles.length; ++i) {
      if (motorcycles[i].getText() == item.detail) {
        motorcyclesCustomList = [motorcycles[i], ...motorcyclesCustomList];
      }
    }

    motorcycles = motorcycles.filter(m => m.getText() != item.detail);

    items = motorcycles.map((m) => { return {value: m.getText(), text: m.getText()}; })
    motorcyclesOut = motorcyclesCustomList.map((m) => { return {text: m.getText()}; })
  }
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
  <Select {items} on:change={chooseMotorcycle} />
  <List items={motorcyclesOut} />
</div>
