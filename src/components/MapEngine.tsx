import { ReactElement } from 'react';

import type { RootState } from '../store'
import { useSelector } from 'react-redux'

import HeroDisplay from './Hero'
import Map from './Map'

function MapEngine(): ReactElement {

  const { hero }  = useSelector((state: RootState) => state.hero);

  return (
    <div className='game-container'>
      <Map debug>
        <HeroDisplay></HeroDisplay>
      </Map>
    </div>
  );
}

export default MapEngine;
