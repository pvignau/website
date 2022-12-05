import React, { useState, ReactElement } from 'react';

import type { RootState } from '../store'
import { makeTalk, stopTalking } from '../store/slices/heroReducer'
import { useSelector, useDispatch } from 'react-redux'
import './Hero.scss';

function HeroTalk(props: any): ReactElement {
  const { hero } = useSelector((state: RootState) => state.hero)
  const [dismiss, setDismiss] = useState(false)
  const [line, setLine] = useState(0)
  const dispatch = useDispatch();
  
  React.useEffect(() => {
    const nextLineOrClose = () => {
      if (line < hero.speech.length - 1) {
        setLine(line+1);
      } else {
        dispatch(stopTalking());
      }
      window.removeEventListener('keydown', nextLineOrClose);
    }

    setTimeout(() => {
      setDismiss(true);
      window.addEventListener('keydown', nextLineOrClose)
    },1000);

    return () => {
      window.removeEventListener('keydown', nextLineOrClose);
    }
  });

  return (
    <dialog className='bubble' open>
      <p>{hero.speech[line]}</p>
      {dismiss &&
        <div className='hint'>Press key ...</div>
      }
    </dialog>
  )
}

function HeroDisplay(props: any): ReactElement {

  const { hero } = useSelector((state: RootState) => state.hero)
  const dispatch = useDispatch();

  const talk = () => {
    dispatch(makeTalk(['Outch ! It hurts !', 'Don\'t do that !']));
  }

  return (
    <div
      id="hero"
      className={`hero ${hero.isMoving ? 'walk' : ''} ${hero.direction.toLowerCase()}`}
      style={{ top: `${hero.position.y}px`, left: `${hero.position.x}px` }}
      onClick={talk}>
      {hero.isTalking &&
        <HeroTalk></HeroTalk>
      }
    </div>
  );
}

export default HeroDisplay;
