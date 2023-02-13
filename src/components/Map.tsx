import { ReactElement } from 'react';
import './Map.css'
import WorldMap from '../maps/world.png'
import Tile from './Map/Tile';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getHeroCenteredMapOffset } from '../feature/map/helper';

export default function Map(props: any): ReactElement {
  
  const map = useSelector((state: RootState) => state.map)
  const { hero }  = useSelector((state: RootState) => state.hero)
  let tilesComponents: JSX.Element[] = [];

  /*
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
    let height = 12, width = 0;
    collisions.forEach((line: number[]) => {
      line.forEach(column => {
        if (column > 0) {
          tiles.push({x: width, y: height})
        }
        width += 32;
      });
      width = 0;
      height += 32;
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
        width += 32;
      });
      width = 0;
      height += 32;
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
        width += 32;
      });
      width = 0;
      height += 32;
    });
    dispatch(setMetaTiles(tiles));
  }*/

  if (props.debug) {
    tilesComponents = [...map.tiles.map((tile: {x: Number, y: Number, meta?: any }) => { return (<Tile type={tile?.meta.action === 'redirect' ? 'door' : 'collision'} key={tile.x + '-' + tile.y} x={tile.x} y={tile.y}></Tile>) } )]
  }

  // get map offset
  const mapOffset = getHeroCenteredMapOffset(hero);

  return (
    <div className="map" style={{top: `${mapOffset.y}px`, left: `${mapOffset.x}px`}}>
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
