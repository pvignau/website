import { ReactElement } from 'react';
import './Map.css'
import Tile from './Map/Tile';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getHeroCenteredMapOffset } from '../feature/map/helper';

export default function Map(props: any): ReactElement {
  
  const map = useSelector((state: RootState) => state.map)
  const { hero }  = useSelector((state: RootState) => state.hero)
  let tilesComponents: JSX.Element[] = [];

  if (props.debug) {
    tilesComponents = [...map.tiles.map((tile: {x: Number, y: Number, meta?: any }) => { return (<Tile type={tile?.meta.action === 'redirect' ? 'door' : 'collision'} key={tile.x + '-' + tile.y} x={tile.x} y={tile.y}></Tile>) } )]
  }

  // get map offset
  const mapOffset = getHeroCenteredMapOffset(hero);

  return (
    <div className="map" style={{width: `${map.size.width}px`, height: `${map.size.height}px`, top: `${mapOffset.y}px`, left: `${mapOffset.x}px`}}>
        <img src={ map.background } alt="map"/>
        {props.debug && 
          <div className='collisions-tiles'>
            {tilesComponents}
          </div>
        }
        {props.children}
    </div>
  );
}
