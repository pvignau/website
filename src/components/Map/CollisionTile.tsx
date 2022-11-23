import { ReactElement } from 'react';
import './CollisionTile.scss'

function CollistionTile(props: any): ReactElement {
  return (
    <div className="collision-tile" style={{top: props.y + 'px', left: props.x + 'px'}}></div>
  );
}

export default CollistionTile;
