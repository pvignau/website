import { ReactElement } from 'react';

import type { RootState } from '../store'
import { useSelector } from 'react-redux'

import HeroDisplay from './Hero'
import Map from './Map'

function MapEngine(): ReactElement {

  const { hero }  = useSelector((state: RootState) => state.hero);

  const heroOffset = {
    x: 245,
    y: 234
  }

  return (
    <div className='game-container'>
      <Map style={{top: `calc( 50% - ${hero.position.y - 234}px)`, left: `calc( 50% - ${hero.position.x - 245}px)`}} debug></Map>
      <HeroDisplay></HeroDisplay>
    </div>
  );
}

export default MapEngine;
