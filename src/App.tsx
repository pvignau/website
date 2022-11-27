import './App.scss';
import React, { useState } from 'react';
import MapEngine from './components/MapEngine'
import Loader from './components/Loader'
import type { RootState } from './store'
import { useSelector, useDispatch } from 'react-redux'
import { goUp, goDown, goLeft, goRight, stopHero } from './store/slices/heroReducer'
import { store } from './store';
import { ObjectMoveHelper } from './feature/objects/helper';

function App() {
  // eslint-disable-next-line
  const { hero } = useSelector((state: RootState) => state.hero); // This makes a ref event if we do not use it ? Black magic ... 
  const isLoading = useSelector((state: RootState) => state.root.isLoading); // This makes a ref event if we do not use it ? Black magic ... 
  const dispatch = useDispatch();

  const keysPressed: string[] = [];
  const [interval, setIntervalId] = useState<NodeJS.Timeout | string | number | undefined>(undefined);

  const mapOffset = {
    x: (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 2) - (store.getState().hero.hero.position.x + (28 / 2)), 
    y: (Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 2) - (store.getState().hero.hero.position.y + (32 / 2))
  };

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

    mapOffset.x = (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 2) - (store.getState().hero.hero.position.x + (28 / 2));
    mapOffset.y = (Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 2) - (store.getState().hero.hero.position.y + (32 / 2));
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

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    setIntervalId(setInterval(move, 100));
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return <div>
      <Loader assetsToLoad={[
        import('./img/hero/spriteDown.png'),
        import('./img/hero/spriteUp.png'),
        import('./img/hero/spriteLeft.png'),
        import('./img/hero/spriteRight.png'),
        import('./maps/world.png')
      ]}></Loader>
      <MapEngine style={{display: 'none', top: `${mapOffset.y}px`, left: `${mapOffset.x}px`}} ></MapEngine>
    </div>
  } else {
    return <MapEngine style={{top: `${mapOffset.y}px`, left: `${mapOffset.x}px`}} ></MapEngine>
  }
}

export default App;
