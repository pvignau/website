import { ReactElement } from 'react';
import './Map.scss'
import WorldMap from '../maps/world.png'
import WorldMapCollisions from '../maps/world-collisions.json'
import CollistionTile from './Map/CollisionTile';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setCollisionTiles } from '../feature/maps/mapSlice';

export default function Map(props: any): ReactElement {
  
  const map = useSelector((state: RootState) => state.map)
  const dispatch = useDispatch();
  let collisionTilesComponents: JSX.Element[] = [];

  const tiles:{x: Number, y: Number }[] = [];
  if (map.collisionTiles.length === 0) {
    let height = 6, width = 0;
    WorldMapCollisions.forEach((line: number[]) => {
      line.forEach(column => {
        if (column > 0) {
          tiles.push({x: width, y: height})
        }
        width += 12;
      });
      width = 0;
      height += 12;
    });

    tiles.push({x: 600, y: 610})
    dispatch(setCollisionTiles(tiles));
  }

  if (props.debug) {
    collisionTilesComponents = map.collisionTiles.map((tile: {x: Number, y: Number }) => { return (<CollistionTile key={tile.x + '-' + tile.y} x={tile.x} y={tile.y}></CollistionTile>) } )
  }

  return (
    <div className="map" style={props.style}>
        <img src={ WorldMap } alt="map"/>
        {props.debug && 
          <div className='collisions-tiles'>
            {collisionTilesComponents}
          </div>
        }
    </div>
  );
}
