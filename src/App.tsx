import './App.scss';
import Hero from './components/Hero'
import WorldMap from './img/world.png'

function App() {
  return (
    <div className='game-container'>
      <div className="map">
        <img src={ WorldMap } />
      </div>
      <Hero></Hero>
    </div>
  );
}

export default App;
