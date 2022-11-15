import { ReactElement } from 'react';

import type { RootState } from '../store'
import { useSelector, useDispatch } from 'react-redux'
import './Hero.css';

function Hero(): ReactElement {

  const { hero }  = useSelector((state: RootState) => state.hero)

  return (
    <div className={`hero walk-${hero.direction.toLowerCase()}`}></div>
  );
}

export default Hero;
