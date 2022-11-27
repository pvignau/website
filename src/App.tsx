import './App.scss';
import React, { useMemo, useState } from 'react';
import MapEngine from './components/MapEngine'
import Loader from './components/Loader'
import type { RootState } from './store'
import { useSelector, useDispatch } from 'react-redux'
import { goUp, goDown, goLeft, goRight, stopHero } from './store/slices/heroReducer'
import { ObjectMoveHelper } from './feature/objects/helper';

function App() {
  // eslint-disable-next-line
//   const { hero } = useSelector((state: RootState) => state.hero); // This makes a ref event if we do not use it ? Black magic ... 
  const isLoading = useSelector((state: RootState) => state.root.isLoading); // This makes a ref event if we do not use it ? Black magic ... 
  const dispatch = useDispatch();

  const keysPressed: string[] = useMemo(() => [], []);
  const [interval, setIntervalId] = useState<NodeJS.Timeout | string | number | undefined>(undefined);

  React.useEffect(() => {
    const move = () => {
      switch (keysPressed[keysPressed.length - 1]) {
        case 'ArrowDown':
          if (ObjectMoveHelper.canMoveDown(12) === true) {
            dispatch(goDown());
          }
          break;
        case 'ArrowLeft':
          if (ObjectMoveHelper.canMoveLeft(12) === true) {
            dispatch(goLeft())
          }
          break;
        case 'ArrowUp':
          if (ObjectMoveHelper.canMoveUp(12) === true) {
            dispatch(goUp())
          }
          break;
        case 'ArrowRight':
          if (ObjectMoveHelper.canMoveRight(12) === true) {
            dispatch(goRight())
          }
          break;
      }
    }

    const handleKeyDown = (e: any) => {
      if (keysPressed.indexOf(e.key) === -1) {
        keysPressed.push(e.key);
      }
    }

    const handleKeyUp = (e: any) => {
      for (let i = 0; i < keysPressed.length; i++) {
        if (keysPressed[i] === e.key) {
          keysPressed.splice(i, 1);
        }
      }
      if (keysPressed.length === 0) dispatch(stopHero());
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    if (interval === undefined) {
      setIntervalId(setInterval(move, 100));
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, [dispatch, interval, keysPressed]);

  if (isLoading) {
    return <div>
      <Loader assetsToLoad={[
        import('./img/hero/spriteDown.png'),
        import('./img/hero/spriteUp.png'),
        import('./img/hero/spriteLeft.png'),
        import('./img/hero/spriteRight.png'),
        import('./maps/world.png')
      ]}></Loader>
      <MapEngine></MapEngine>
    </div>
  } else {
    return <MapEngine></MapEngine>
  }
}

export default App;
