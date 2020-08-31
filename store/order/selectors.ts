import { State } from '..';
import { OrderState, Order, Place, OrderStatus } from './types';

export const getOrderState = (state: State): OrderState => state.order;

export const getOrders = (state: State): Order[] => getOrderState(state).orders;

export const getOrderById = (state: State) => (id: string): Order =>
  getOrderState(state).ordersById[id];

export const getOngoingOrders = (state: State): Order[] =>
  getOrders(state).filter((order) => order.status === OrderStatus.Dispatching);

export const getPlacesFromPreviousOrders = (state: State): Place[] =>
  getOrders(state).reduce<Place[]>((places, order) => {
    let result = places;
    const { origin, destination } = order;
    if (!result.some((place) => place.address === origin.address)) result = [...result, origin];
    if (!result.some((place) => place.address === destination.address))
      result = [...result, destination];

    return result;
  }, []);
