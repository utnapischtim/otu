<script lang="ts">
  import { Button, Select, List } from "smelte";
  import { resetMotorcycles, customList } from "../store";

  export let motorcycles = [];
  export let motorcyclesCustomList = [];

  let motorcyclesOut = [];
  let items = [];

  $: {
    items = motorcycles.filter(m => !m.isUsed).map((m) => { return {value: m.getText(), text: m.getText()}; });
    motorcyclesOut = motorcyclesCustomList.map((m) => { return {text: m.getText()}; })
  }

  function chooseMotorcycle(item) {
    for (let i = 0; i < motorcycles.length; ++i) {
      if (motorcycles[i].getText() == item.detail) {
        motorcycles[i].isUsed = true;
        motorcyclesCustomList = [motorcycles[i], ...motorcyclesCustomList];
      }
    }

    $customList = true;
  }

  function handleClickReset() {
    motorcyclesCustomList = [];
    motorcyclesOut = [];
    motorcycles.forEach(m => m.isUsed = false);
    $resetMotorcycles = true;
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

  .motorcycle-custom-list-item {
    float: right;
    margin: 5px
  }

  .motorcycle-custom-list-item:after {
    content: ",";
  }
</style>

<div class="polygon-menu">
  <!-- <Button color="red">clone</Button> -->
  <Button color="red" on:click={handleClickReset}>reset</Button>
  <Select {items} on:change={chooseMotorcycle} />
  <List items={motorcyclesOut}>
    <li slot="item" let:item={item} class="motorcycle-custom-list-item">
      {item.text}
    </li>
  </List>
</div>
