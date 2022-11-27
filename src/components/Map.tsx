import { ReactElement } from 'react';
import './Map.css'
import WorldMap from '../maps/world.png'
import WorldJson from '../maps/world.json'
import Tile from './Map/Tile';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setCollisionTiles, setMetaTiles } from '../store/slices/mapReducer';

export default function Map(props: any): ReactElement {
  
  const map = useSelector((state: RootState) => state.map)
  const dispatch = useDispatch();
  let tilesComponents: JSX.Element[] = [];

  // FIXME : Type this
  // FIXME : WOW CLEAN THIS !!!!
  let tiles:{x: Number | null, y: Number | null, meta?: any}[] = [];
  const metaLayer: any = WorldJson.layers.find((layer: any) => layer.name === 'meta');
  if (map.collisionTiles.length === 0) {
    const collisionsLayer: any = metaLayer.layers.find((layer: any) => layer.name === 'collisions')
    const collisions: any[] = [];
    while(collisionsLayer.data.length > 0) {
      collisions.push(collisionsLayer.data.splice(0, collisionsLayer.width));
    }
    let height = 0, width = 0;
    collisions.forEach((line: number[]) => {
      line.forEach(column => {
        if (column > 0) {
          tiles.push({x: width, y: height})
        }
        width += 36;
      });
      width = 0;
      height += 36;
    });
    dispatch(setCollisionTiles(tiles));

    let tile: {x: Number | null, y: Number | null, meta?: any} = {x: null, y: null};
    tiles = [];
    const workLayer: any = metaLayer.layers.find((layer: any) => layer.name === 'path-work')
    const homeLayer: any = metaLayer.layers.find((layer: any) => layer.name === 'path-home')
    let tileMeta: any
    let meta: any[] = [];
    if (workLayer.properties) {
      // find meta
      tileMeta = {
        action: 'redirect',
        value: workLayer.properties.find((property: any) => property.name === 'address')?.value
      }
    }
    while(workLayer.data.length > 0) {
      meta.push(workLayer.data.splice(0, workLayer.width));
    }
    height = 0;
    width = 0;
    meta.forEach((line: number[]) => {
      line.forEach(column => {
        if (column > 0) {
          tile = {x: width, y: height}
          if (tileMeta) tile.meta = tileMeta
          tiles.push(tile)
        }
        width += 36;
      });
      width = 0;
      height += 36;
    });

    meta = [];
    if (homeLayer.properties) {
      // find meta
      tileMeta = {
        action: 'redirect',
        value: homeLayer.properties.find((property: any) => property.name === 'address')?.value
      }
    }
    while(homeLayer.data.length > 0) {
      meta.push(homeLayer.data.splice(0, homeLayer.width));
    }
    height = 0;
    width = 0;
    meta.forEach((line: number[]) => {
      line.forEach(column => {
        if (column > 0) {
          tile = {x: width, y: height}
          if (tileMeta) tile.meta = tileMeta
          tiles.push(tile)
        }
        width += 36;
      });
      width = 0;
      height += 36;
    });
    dispatch(setMetaTiles(tiles));
  }

  if (props.debug) {
    tilesComponents = map.collisionTiles.map((tile: {x: Number, y: Number }) => { return (<Tile type="collision" key={tile.x + '-' + tile.y} x={tile.x} y={tile.y}></Tile>) } )
    tilesComponents = [...tilesComponents, ...map.metaTiles.map((tile: {x: Number, y: Number }) => { return (<Tile type="door" key={tile.x + '-' + tile.y} x={tile.x} y={tile.y}></Tile>) } )]
  }

  return (
    <div className="map" style={props.style}>
        <img src={ WorldMap } alt="map"/>
        {props.debug && 
          <div className='collisions-tiles'>
            {tilesComponents}
          </div>
        }
        {props.children}
    </div>
  );
}
