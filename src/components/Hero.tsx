import { ReactElement } from 'react';

import type { RootState } from '../store'
import { useSelector } from 'react-redux'
import './Hero.scss';

function HeroDisplay(props: any): ReactElement {

  const { hero }  = useSelector((state: RootState) => state.hero)

  return (
    <div id="hero" className={`hero ${hero.isMoving ? 'walk' : ''} ${hero.direction.toLowerCase()}`} style={{top: `${hero.position.y}px`, left: `${hero.position.x}px`}}></div>
  );
}

export default HeroDisplay;
