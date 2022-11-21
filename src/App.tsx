import './App.scss';
import React from 'react';
import MapEngine from './components/MapEngine'

import type { RootState } from './store'
import { useSelector, useDispatch } from 'react-redux'
import { goUp, goDown, goLeft, goRight } from './feature/hero/heroSlice'

function App() {
  const { hero } = useSelector((state: RootState) => state.hero)
  const dispatch = useDispatch();

  const keysPressed: string[] = [];
  let interval: NodeJS.Timeout | string | number | undefined;
  
  const move = () => {
    switch (keysPressed[keysPressed.length - 1]) {
      case 'ArrowDown':
        dispatch(goDown())
        break;
      case 'ArrowLeft':
        dispatch(goLeft())
        break;
      case 'ArrowUp':
        dispatch(goUp())
        break;
      case 'ArrowRight':
        dispatch(goRight())
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
  }

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    interval = setInterval(move, 100);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, []);

  return (
    <MapEngine></MapEngine>
  );
}

export default App;
