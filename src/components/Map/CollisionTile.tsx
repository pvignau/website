import { ReactElement } from 'react';
import './CollisionTile.scss'

function CollistionTile(props: any): ReactElement {
  return (
    <div className="collision-tile" style={{top: props.x, left: props.y}}></div>
  );
}

export default CollistionTile;
