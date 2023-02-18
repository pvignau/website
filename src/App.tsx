import './App.scss';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import WorldMapBackground from './maps/world.webp';
import WorldJson from './maps/world.json';

import MapEngine from './components/MapEngine';
import Loader from './components/Loader';
import useMove from './hooks/useMove';
import { initMap } from './store/slices/mapReducer';
import { setHeroPosition } from './store/slices/heroReducer';
import type { RootState } from './store';

function App() {
  const isLoading = useSelector((state: RootState) => state.root.isLoading); // This makes a ref event if we do not use it ? Black magic ... 
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setHeroPosition({x: 1525, y: 1750}))
    dispatch(initMap({name: 'world', background: WorldMapBackground, json: WorldJson }));
  }, [])

  useMove();

  if (isLoading) {
    return <div>
      <Loader assetsToLoad={[
        import('./img/hero/spriteDown.webp'),
        import('./img/hero/spriteUp.webp'),
        import('./img/hero/spriteLeft.webp'),
        import('./img/hero/spriteRight.webp'),
        import('./maps/world.webp')
      ]}></Loader>
      <MapEngine></MapEngine>
    </div>
  } else {
    return <MapEngine></MapEngine>
  }
}

export default App;
