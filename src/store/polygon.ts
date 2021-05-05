import { writable } from 'svelte/store';

function createPolygonStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    set,
    add: (polygon) => update(list => [...list, polygon])
  }
}

export const polygons = createPolygonStore();

export const polygonActive = writable([]);