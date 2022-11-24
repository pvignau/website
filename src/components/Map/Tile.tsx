import { ReactElement } from 'react';
import './Tile.scss'

function Tile(props: any): ReactElement {
  return (
    <div className={`${props.type} tile`} style={{top: props.y + 'px', left: props.x + 'px'}}></div>
  );
}

export default Tile;
