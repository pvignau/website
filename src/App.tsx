import './App.scss';
import React from 'react';
import MapEngine from './components/MapEngine'

import type { RootState } from './store'
import { useSelector, useDispatch } from 'react-redux'
import { goUp, goDown, goLeft, goRight } from './feature/hero/heroSlice'
import { ObjectMoveHelper } from './feature/objects/helper';

function App() {
  const { hero } = useSelector((state: RootState) => state.hero)
  const { collisionTiles } = useSelector((state: RootState) => state.map)
  const dispatch = useDispatch();

  const keysPressed: string[] = [];
  let interval: NodeJS.Timeout | string | number | undefined;
  
  const move = () => {
    let canMove = true
    switch (keysPressed[keysPressed.length - 1]) {
      case 'ArrowDown':
        if (!ObjectMoveHelper.canMoveDown(hero, 10)) {
          console.log('collide');
        }
        dispatch(goDown());
        break;
      case 'ArrowLeft':
        if (!ObjectMoveHelper.canMoveLeft(hero, 10)) {
          console.log('collide');
        }
        dispatch(goLeft())
        break;
      case 'ArrowUp':
        if (!ObjectMoveHelper.canMoveUp(hero, 10)) {
          console.log('collide');
        }
        dispatch(goUp())
        break;
      case 'ArrowRight':
        if (!ObjectMoveHelper.canMoveRight(hero, 10)) {
          console.log('collide');
        }
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
    interval = setInterval(move, 50);
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
