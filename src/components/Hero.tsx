import { ReactElement } from 'react';
import './Hero.css';

function Hero(props: {x?: Number, y?: Number}): ReactElement {

  let position: Object = {
    x: props.x,
    y: props.y
  }

  return (
    <div className="hero walk-down"></div>
  );
}

export default Hero;
