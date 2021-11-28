<script lang="ts">
  import { Button, Select, List, Switch, Checkbox } from "smelte";
  import { resetMotorcycles, addedToCustomList, removedFromCustomList, alterMotorcycle, labelOn, isShuffled } from "../store";

  export let motorcycles = [];
  export let motorcyclesCustomList = [];

  let motorcyclesOut = [];
  let items = [];

  let inUseNodeNames = {};

  let isHistory = true;
  let isSort = false;

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
    items = motorcycles
      .filter(m => !m.isUsed)
      .map((m) => { return {value: m.getText(), text: m.getText()}; });

    if (isHistory) {
      motorcyclesOut = [...motorcyclesCustomList].map((m) => ({text: m.getText()}));
    }

    if (isSort) {
      motorcyclesOut = [...motorcyclesCustomList]
        .sort((a, b) => b.reductionCounter - a.reductionCounter)
        .map((m) => { return {text: m.getText()}; });
    }
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

    $addedToCustomList = true;
  }

  function removeMotorcycle(item) {
    const nodeName = item.target.dataset.name.split(" ")[0];

    for (const motorcycle of motorcyclesCustomList) {
      if (motorcycle.getNodeName() == nodeName) {
        motorcycle.isUsed = false;
      }
    }

    motorcyclesCustomList = motorcyclesCustomList.filter(m => m.getNodeName() != nodeName);

    delete inUseNodeNames[nodeName];

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

    $isShuffled = true;
  }

  function sortByFast() {
    motorcyclesCustomList = motorcycles
      .map((v) => ({v, sort: v.velocity}))
      .sort((a, b) => b.sort - a.sort)
      .map(({v}) => v);

    motorcyclesCustomList.forEach(v => v.isUsed = true);

    $isShuffled = true;
  }

  function sortBySlow() {
    motorcyclesCustomList = motorcycles
      .map((v) => ({v, sort: v.velocity}))
      .sort((a, b) => a.sort - b.sort)
      .map(({v}) => v);

    motorcyclesCustomList.forEach(v => v.isUsed = true);

    $isShuffled = true;

  }

  function switchLabel() {
    $labelOn = !$labelOn;
  }

  function history() {
    isHistory = true;
    isSort = false;
  }

  function sort() {
    isHistory = false;
    isSort = true;
  }
</script>

<style>
  .polygon-menu {
    border: 1px solid black;
    float: right;
    padding: 10px;
    position: absolute;
    right: 25px;
    top: 250px;
    width: 302px;
  }

  :global(.motorcycle-custom-list) {
    columns: 4;
    height: 200px;
    overflow-y: auto;
    padding: 10px 0px;
  }

  .motorcycle-custom-list-item {
    content: ',';
    cursor: pointer;
  }

  hr {
    border-top: 1px solid #ccc8c8;
    margin: 10px 0;
  }

  :global(.choose-motorcycle ul) {
    height: 300px;
    overflow-y: scroll;
  }
</style>

<div class="polygon-menu">
  <!-- <Button color="red">clone</Button> -->
  <Button color="red" on:click={handleClickReset}>reset</Button>

  <hr/>

  <Button color="red" on:click={shuffle}>shuffle</Button>
  <Button color="red" on:click={sortByFast}>fastest</Button>
  <Button color="red" on:click={sortBySlow}>slowest</Button>

  <hr/>

  <Checkbox checked label="Label on/off" on:change={switchLabel}/>

  <hr/>

  <h3>Add motorcycle to custom list</h3>
  <Select {items} class="choose-motorcycle" on:change={chooseMotorcycle} />

  <hr/>

  <h3>
    <Button color="secondary" light outlined on:click={history}>history</Button>
    <Button color="secondary" light outlined on:click={sort}>sort</Button>
  </h3>
  <List items={motorcyclesOut} classes="motorcycle-custom-list">
    <li slot="item" let:item={item} class="motorcycle-custom-list-item" data-name={item.text} on:click={removeMotorcycle}>
      {item.text}
    </li>
  </List>

</div>
