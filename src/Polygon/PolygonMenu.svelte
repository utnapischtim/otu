<script lang="ts">
  import { Button, Select, List } from "smelte";
  import { resetMotorcycles, addedToCustomList, removedFromCustomList } from "../store";

  export let motorcycles = [];
  export let motorcyclesCustomList = [];

  let motorcyclesOut = [];
  let motorcyclesOutSelectable = [];
  let items = [];

  $: {
    items = motorcycles.filter(m => !m.isUsed).map((m) => { return {value: m.getText(), text: m.getText()}; });
    motorcyclesOut = motorcyclesCustomList.map((m) => { return {text: m.getText()}; })
    motorcyclesOutSelectable = motorcyclesCustomList.map((m) => { return {value: m.getText(), text: m.getText()}; });
  }

  function chooseMotorcycle(item) {
    for (let i = 0; i < motorcycles.length; ++i) {
      if (motorcycles[i].getText() == item.detail) {
        motorcycles[i].isUsed = true;
        motorcyclesCustomList = [...motorcyclesCustomList, motorcycles[i]];
      }
    }

    $removedFromCustomList = false;
    $addedToCustomList = true;
  }

  function removeMotorcycle(item) {
    for (const motorcycle of motorcyclesCustomList) {
      if (motorcycle.getText() == item.detail) {
        motorcycle.isUsed = false;
      }
    }

    motorcyclesCustomList = motorcyclesCustomList.filter(m => m.getText() != item.detail);

    $addedToCustomList = false;
    $removedFromCustomList = true;
  }

  function handleClickReset() {
    motorcyclesCustomList = [];
    motorcyclesOut = [];
    motorcycles.forEach(m => m.isUsed = false);
    $resetMotorcycles = true;
  }

  function shuffle() {
    motorcyclesCustomList = motorcycles
      .map((v) => ({v, sort: Math.random()}))
      .sort((a, b) => a.sort - b.sort)
      .map(({v}) => v);

    $removedFromCustomList = false;
    $addedToCustomList = true;
  }
</script>

<style>
  .polygon-menu {
    position: relative;
    top: -88%;
    border: 1px solid black;
    width: 255px;
    left: calc(100% - 255px);
  }

  .motorcycle-custom-list-item {
    margin: 5px
  }

  .motorcycle-custom-list-item:after {
    content: ",";
  }

  h3 {
    border-top: 1px solid black;
  }
</style>

<div class="polygon-menu">
  <!-- <Button color="red">clone</Button> -->
  <Button color="red" on:click={handleClickReset}>reset</Button>
  <Button color="red" on:click={shuffle}>shuffle</Button>
  <h3>Add motorcycle to custom list</h3>
  <Select {items} on:change={chooseMotorcycle} />
  <h3>History of added motorcycle's</h3>
  <List items={motorcyclesOut}>
    <li slot="item" let:item={item} class="motorcycle-custom-list-item">
      {item.text}
    </li>
  </List>
  <h3>Remove motorcycle to custom list</h3>
  <Select items={motorcyclesOutSelectable} on:change={removeMotorcycle} />
</div>
