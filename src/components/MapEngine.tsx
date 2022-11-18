import { ReactElement } from 'react';

import type { RootState } from '../store'
import { useSelector } from 'react-redux'

import HeroDisplay from './Hero'
import Map from './Map'

function MapEngine(): ReactElement {

  const { hero }  = useSelector((state: RootState) => state.hero);

  return (
    <div className='game-container'>
      <Map style={{top: `calc( 50% - ${hero.position.y}px)`, left: `calc( 50% - ${hero.position.x}px)`}}></Map>
      <HeroDisplay></HeroDisplay>
    </div>
  );
}

export default MapEngine;
