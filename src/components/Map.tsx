import { ReactElement } from 'react';
import styled from 'styled-components';
import WorldMap from '../img/world.png'



export default function Map(props: any): ReactElement {

    const MapContainer = styled.div`
        position: absolute;
        width: 1441px;
        height: 1448px;
        top: calc( 50% - ${props.x});
        left: calc( 50% - ${props.y});
        transform: scale(3);
    `

  return (
    <MapContainer>
        <img src={ WorldMap } />
    </MapContainer>
  );
}
