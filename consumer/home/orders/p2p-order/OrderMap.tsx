import polyline from '@mapbox/polyline';
import { Order } from 'appjusto-types';
import React from 'react';
import { Marker, Polyline } from 'react-native-maps';

import { pinUser, pinPackage } from '../../../../assets/icons';
import DefaultMap from '../../../../common/components/DefaultMap';

type Props = {
  order: Order;
};

export default function ({ order }: Props) {
  const { origin, destination, routePolyline } = order;

  const routeCoordinates = polyline.decode(routePolyline).map((pair) => {
    return { latitude: pair[0], longitude: pair[1] };
  });

  console.log('OrderMap');
  console.log('origin: ', origin.location);
  console.log('destination: ', destination.location);

  return (
    <DefaultMap
      style={{ width: '100%', height: '100%' }}
      minZoomLevel={13}
      maxZoomLevel={13}
      fitToElements
    >
      <Marker coordinate={origin.location} icon={pinPackage} />
      <Marker coordinate={destination.location} icon={pinUser} />
      <Polyline coordinates={routeCoordinates} />
    </DefaultMap>
  );
}
