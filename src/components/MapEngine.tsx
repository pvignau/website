import { ReactElement } from 'react';

import HeroDisplay from './Hero'
import Map from './Map'

function MapEngine(props: any): ReactElement {

  return (
    <div className='game-container'>
      <Map debug={window.debug} style={props.style}>
        <HeroDisplay></HeroDisplay>
      </Map>
    </div>
  );
}

export default MapEngine;
