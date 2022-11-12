import './App.scss';
import Hero from './components/Hero'
import WorldMap from './img/world.png'

function App() {
  return (
    <div className='game-container'>
      <div className="map"></div>
      <Hero></Hero>
    </div>
  );
}

export default App;
