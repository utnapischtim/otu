<script lang="ts">
  import { Button, Select, List } from "smelte";
  import { resetMotorcycles, addedToCustomList, removedFromCustomList, alterMotorcycle } from "../store";

  export let motorcycles = [];
  export let motorcyclesCustomList = [];

  let motorcyclesOut = [];
  let motorcyclesOutSelectable = [];
  let items = [];

  let inUseNodeNames = {};

  $: if ($alterMotorcycle) {
    let nodeName = $alterMotorcycle;

    if (nodeName in inUseNodeNames) {
      removeMotorcycle({detail: nodeName});
    } else {
      chooseMotorcycle({detail: nodeName});
    }

    alterMotorcycle.set("");
  }

  $: {
    items = motorcycles.filter(m => !m.isUsed).map((m) => { return {value: m.getText(), text: m.getText()}; });
    motorcyclesOut = motorcyclesCustomList.map((m) => { return {text: m.getText()}; })
    motorcyclesOutSelectable = motorcyclesCustomList.map((m) => { return {value: m.getText(), text: m.getText()}; });
  }

  function chooseMotorcycle(item) {
    const nodeName = item.detail.split(" ")[0];
    for (let i = 0; i < motorcycles.length; ++i) {
      if (motorcycles[i].getNodeName() == nodeName) {
        motorcycles[i].isUsed = true;
        motorcyclesCustomList = [...motorcyclesCustomList, motorcycles[i]];
      }
    }

    inUseNodeNames[nodeName] = true;

    $removedFromCustomList = false;
    $addedToCustomList = true;
  }

  function removeMotorcycle(item) {
    const nodeName = item.detail.split(" ")[0];
    for (const motorcycle of motorcyclesCustomList) {
      if (motorcycle.getNodeName() == nodeName) {
        motorcycle.isUsed = false;
      }
    }

    motorcyclesCustomList = motorcyclesCustomList.filter(m => m.getNodeName() != nodeName);

    delete inUseNodeNames[nodeName];

    $addedToCustomList = false;
    $removedFromCustomList = true;
  }

  function handleClickReset() {
    motorcyclesCustomList = [];
    motorcyclesOut = [];
    motorcycles.forEach(m => m.isUsed = false);
    inUseNodeNames = {};
    $resetMotorcycles = true;
  }

  function shuffle() {
    motorcyclesCustomList = motorcycles
      .map((v) => ({v, sort: Math.random()}))
      .sort((a, b) => a.sort - b.sort)
      .map(({v}) => v);

    motorcyclesCustomList.forEach(v => v.isUsed = true);

    $removedFromCustomList = false;
    $addedToCustomList = true;
  }
</script>

<style>
  .polygon-menu {
    position: relative;
    top: -79%;
    border: 1px solid black;
    width: 255px;
    left: 101%;
  }

  List {
    columns: 4;
  }

  .motorcycle-custom-list-item {
    content: ',';
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
  <List items={motorcyclesOut} classes="motorcycle-custom-list">
    <li slot="item" let:item={item} class="motorcycle-custom-list-item">
      {item.text}
    </li>
  </List>
  <h3>Remove motorcycle to custom list</h3>
  <Select items={motorcyclesOutSelectable} on:change={removeMotorcycle} />
</div>
