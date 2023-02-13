import { useState, useEffect, useMemo } from "react";
import { useDispatch } from 'react-redux'
import { goUp, goDown, goLeft, goRight, stopHero } from '../store/slices/heroReducer'
import { ObjectMoveHelper } from '../feature/objects/helper';
import { store } from "../store"
import type { ITile } from '../types';

// TODO : Rework this, needs to return state and function

const useMove = () => {
  const dispatch = useDispatch();
  const [interval, setIntervalId] = useState<NodeJS.Timeout | string | number | undefined>(undefined);

  const keysPressed: string[] = useMemo(() => [], []);

  useEffect(() => {
    const move = () => {
      let blockingTile: ITile | null = null;
      switch (keysPressed[keysPressed.length - 1]) {
        case 'ArrowDown':
          blockingTile = ObjectMoveHelper.getDownBlockingTile(12);
          if (blockingTile === null) {
            dispatch(goDown());
          }
          if (blockingTile && blockingTile.meta.action === 'redirect') {
            // redirect to page
            window.location.href = blockingTile.meta.value;
          }
          break;
        case 'ArrowLeft':
          blockingTile = ObjectMoveHelper.getLeftBlockingTile(12);
          if (blockingTile === null) {
            dispatch(goLeft())
          }
          if (blockingTile && blockingTile.meta.action === 'redirect') {
            // redirect to page
            window.location.href = blockingTile.meta.value;
          }
          break;
        case 'ArrowUp':
          blockingTile = ObjectMoveHelper.getUpBlockingTile(12);
          if (blockingTile === null) {
            dispatch(goUp())
          }
          if (blockingTile && blockingTile.meta.action === 'redirect') {
            // redirect to page
            window.location.href = blockingTile.meta.value;
          }
          break;
        case 'ArrowRight':
          blockingTile = ObjectMoveHelper.getRightBlockingTile(12);
          if (blockingTile === null) {
            dispatch(goRight())
          }
          if (blockingTile && blockingTile.meta.action === 'redirect') {
            // redirect to page
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
      keysPressed.length = 0; // Needed on room change
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, [dispatch, interval, keysPressed]);

  return [store.getState().hero.hero.position]
};

export default useMove;