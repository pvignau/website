import './App.scss';
import React from 'react';
import MapEngine from './components/MapEngine'

import type { RootState } from './store'
import { useSelector, useDispatch } from 'react-redux'
import { goUp, goDown, goLeft, goRight, stopHero } from './feature/hero/heroSlice'
import { store } from './store';
import { ObjectMoveHelper } from './feature/objects/helper';

function App() {
  const { hero } = useSelector((state: RootState) => state.hero)
  const dispatch = useDispatch();

  const keysPressed: string[] = [];
  let interval: NodeJS.Timeout | string | number | undefined;

  const mapOffset = {
    x: (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 2) - (store.getState().hero.hero.position.x + (28 / 2)), 
    y: (Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 2) - (store.getState().hero.hero.position.y + (32 / 2))
  };

  const move = () => {
    let canMove = true
    switch (keysPressed[keysPressed.length - 1]) {
      case 'ArrowDown':
        if (ObjectMoveHelper.canMoveDown(hero, 12)) {
          dispatch(goDown());
        }
        break;
      case 'ArrowLeft':
        if (ObjectMoveHelper.canMoveLeft(hero, 12)) {
          dispatch(goLeft())
        }
        break;
      case 'ArrowUp':
        if (ObjectMoveHelper.canMoveUp(hero, 12)) {
          dispatch(goUp())
        }
        break;
      case 'ArrowRight':
        if (ObjectMoveHelper.canMoveRight(hero, 12)) {
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
    interval = setInterval(move, 100);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, []);

  return (
    <MapEngine style={{top: `${mapOffset.y}px`, left: `${mapOffset.x}px`}} ></MapEngine>
  );
}

export default App;
