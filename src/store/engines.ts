import { writable } from 'svelte/store';

// function createEnginesStore() {
//   const defaults = [{item: "local", active: true}];

//   const { subscribe, update } = writable(defaults);

//   return {
//     subscribe,
//     addEngine: (engine) => update(list => [...list, engine])
//   };
// }

//export const engines = createEnginesStore()
export const engines = writable([{item: "local", active: true}]);
