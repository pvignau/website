import './App.scss';
import React from 'react';
import Hero from './components/Hero'
import Map from './components/Map'

import type { RootState } from './store'
import { useSelector, useDispatch } from 'react-redux'
import { goUp, goDown, goLeft, goRight } from './feature/hero/heroSlice'

function App() {
  const { hero }  = useSelector((state: RootState) => state.hero)
  const dispatch = useDispatch();

  const handleKeyDown = (e: any) => {
    console.log(e.key);
    switch (e.key || e.keyCode) {
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

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    // cleanup this component
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  console.log(hero.position);

  return (
    <div className='game-container'>
      <Map y={hero.position.x + 'px'} x={hero.position.y + 'px'}></Map>
      <Hero ></Hero>
    </div>
  );
}

export default App;
