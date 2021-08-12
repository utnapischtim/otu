import { writable } from 'svelte/store';
//import type * as geom from "geometric";

function createPolygonStore() {
  const { subscribe, set/*, update*/ } = writable([]);

  return {
    subscribe,
    set// ,
    // add: (polygon) => update(list => [...list, polygon])
  }
}

export const polygons = createPolygonStore();

export const polygonActive = writable([]);

export const addedToCustomList = writable(false);

export const removedFromCustomList = writable(false);
