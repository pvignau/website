import { ReactElement } from 'react';

import type { RootState } from '../store'
import { useSelector, useDispatch } from 'react-redux'
import './Hero.css';

function HeroDisplay(props: any): ReactElement {

  const { hero }  = useSelector((state: RootState) => state.hero)

  return (
    <div className={`hero walk-${hero.direction.toLowerCase()}`} style={{top: `${hero.position.y}px`, left: `${hero.position.x}px`}}></div>
  );
}

export default HeroDisplay;
