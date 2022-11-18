import { ReactElement } from 'react';
import './Map.scss'
import WorldMap from '../img/world.png'

export default function Map(props: any): ReactElement {

  return (
    <div className="map" style={props.style}>
        <img src={ WorldMap } />
    </div>
  );
}
