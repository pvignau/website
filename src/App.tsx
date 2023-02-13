import './App.scss';
import React, { useMemo, useState } from 'react';
import MapEngine from './components/MapEngine'
import Loader from './components/Loader'
import type { RootState } from './store'
import { useSelector, useDispatch } from 'react-redux'
import { goUp, goDown, goLeft, goRight, stopHero } from './store/slices/heroReducer'
import { ObjectMoveHelper } from './feature/objects/helper';
import type { ITile } from './types'

function App() {

  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.root.isLoading); // This makes a ref event if we do not use it ? Black magic ... 
  const [interval, setIntervalId] = useState<NodeJS.Timeout | string | number | undefined>(undefined);

  const keysPressed: string[] = useMemo(() => [], []);

  React.useEffect(() => {
    const move = () => {
      let blockingTile: ITile | null = null;
      switch (keysPressed[keysPressed.length - 1]) {
        case 'ArrowDown':
          blockingTile = ObjectMoveHelper.getDownBlockingTile(12);
          if (blockingTile === null) {
            dispatch(goDown());
          }
          if (blockingTile?.meta) {
            // redirect to page
            console.log(blockingTile.meta.action);
            console.log(blockingTile.meta.value);
            window.location.href = blockingTile.meta.value;
          }
          break;
        case 'ArrowLeft':
          blockingTile = ObjectMoveHelper.getLeftBlockingTile(12);
          if (blockingTile === null) {
            dispatch(goLeft())
          }
          if (blockingTile?.meta) {
            // redirect to page
            console.log(blockingTile.meta.action);
            console.log(blockingTile.meta.value);
            window.location.href = blockingTile.meta.value;
          }
          break;
        case 'ArrowUp':
          blockingTile = ObjectMoveHelper.getUpBlockingTile(12);
          if (blockingTile === null) {
            dispatch(goUp())
          }
          if (blockingTile?.meta) {
            // redirect to page
            console.log(blockingTile.meta.action);
            console.log(blockingTile.meta.value);
            window.location.href = blockingTile.meta.value;
          }
          break;
        case 'ArrowRight':
          blockingTile = ObjectMoveHelper.getRightBlockingTile(12);
          if (blockingTile === null) {
            dispatch(goRight())
          }
          if (blockingTile?.meta) {
            // redirect to page
            console.log(blockingTile.meta.action);
            console.log(blockingTile.meta.value);
            window.location.href = blockingTile.meta.value;
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
