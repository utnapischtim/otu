import { writable } from "svelte/store";
//import type * as geom from "geometric";

function createPolygonStore() {
  const { subscribe, set /*, update*/ } = writable([]);

  return {
    subscribe,
    set, // ,
    // add: (polygon) => update(list => [...list, polygon])
  };
}

export const polygons = createPolygonStore();

export const polygonActive = writable([]);

export const addedToCustomList = writable(false);

export const removedFromCustomList = writable(false);

export const alterMotorcycle = writable("");

export const labelReflexNodeOn = writable(true);

export const labelIntersectionOn = writable(false);

export const raysOn = writable(true);

export const vertexOn = writable(true);

export const isShuffled = writable(false);
