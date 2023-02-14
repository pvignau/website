import { createSlice } from '@reduxjs/toolkit'
import { ITile } from '../../types';

const initialState: {name?: string | null, background?: string, size: { width: Number, height: Number }, tiles: ITile[], mapOffset: {x: number, y: number}} = {
    name: null,
    background: undefined,
    size: { width: 0, height: 0 },
    tiles: [],
    mapOffset: {x: 0, y: 0}
}

const layerToTiles = function (layer: any): ITile[] {
  const tiles: ITile[] = [];
  const rawTiles: any[] = [];

  while(layer.data.length > 0) {
    rawTiles.push(layer.data.splice(0, layer.width));
  }
  let height = (layer.name === 'collisions') ? 12 : 0, // Specific to fix collisions case
    width = 0;
    const tileMeta = {
      action: layer.properties?.find((property: any) => property.name === 'action')?.value,
      value: layer.properties?.find((property: any) => property.name === 'value')?.value
    }
  rawTiles.forEach((line: number[]) => {
    line.forEach(column => {
      if (column > 0) {
        tiles.push({x: width, y: height, meta: tileMeta})
      }
      width += 32;
    });
    width = 0;
    height += 32;
  });

  return tiles;
}

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setTiles: (state, action) => {
      state.tiles = action.payload;
    },
    setMapOffset: (state, action) => {
      state.mapOffset = action.payload;
    },
    initMap: (state, action) => {
      if (state.name === action.payload.name) { // Same name ? Do not calc again
        return;
      }

      const tiles: ITile[] = [];
      const json = action.payload.json;
      const metaLayer: any = json.layers.find((layer: any) => layer.name === 'meta');

      metaLayer.layers.forEach((layer: typeof metaLayer) => {
        tiles.push(...layerToTiles(layer));
      })

      state.name = action.payload.name;
      state.background = action.payload.background;
      state.size = {
        width: json.width * json.tilewidth,
        height: json.height * json.tileheight,
      }
      state.tiles = tiles;
    }
  },
})

// Action creators are generated for each case reducer function
export const { setTiles, setMapOffset, initMap } = mapSlice.actions

export default mapSlice.reducer