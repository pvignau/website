import './Home.scss';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import HomeMapBackground from './maps/home.webp';
import HomeJson from './maps/home.json';

import MapEngine from './components/MapEngine';
import Loader from './components/Loader';
import useMove from './hooks/useMove';
import { initMap } from './store/slices/mapReducer';
import { setHeroDirection, setHeroPosition } from './store/slices/heroReducer';
import type { RootState } from './store';

function Home() {
  const isLoading = useSelector((state: RootState) => state.root.isLoading); // This makes a ref event if we do not use it ? Black magic ... 
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setHeroPosition({x: 115, y: 180}))
    dispatch(setHeroDirection('up'))
    dispatch(initMap({name: 'home', background: HomeMapBackground, json: HomeJson }));
  }, [])

  useMove();

  if (isLoading) {
    return <div>
      <Loader assetsToLoad={[
        import('./img/hero/spriteDown.webp'),
        import('./img/hero/spriteUp.webp'),
        import('./img/hero/spriteLeft.webp'),
        import('./img/hero/spriteRight.webp'),
        import('./maps/home.webp')
      ]}></Loader>
      <MapEngine></MapEngine>
    </div>
  } else {
    return <MapEngine></MapEngine>
  }
}

export default Home;
