import './App.scss';
import MapEngine from './components/MapEngine';
import Loader from './components/Loader';
import type { RootState } from './store';
import { useSelector } from 'react-redux';
import useMove from './hooks/useMove';

function App() {
  const isLoading = useSelector((state: RootState) => state.root.isLoading); // This makes a ref event if we do not use it ? Black magic ... 

  useMove();

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
