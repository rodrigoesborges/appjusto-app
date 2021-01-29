import {
  Business,
  ChatMessage,
  ConsumerProfile,
  Cuisine,
  Fare,
  Issue,
  IssueType,
  Order,
  OrderIssue,
  OrderRejection,
  OrderStatus,
  Place,
  PlaceOrderPayload,
  Review,
  WithId,
} from 'appjusto-types';
import { OrderItem } from 'appjusto-types/order/item';
import firebase from 'firebase';
import { isEmpty } from 'lodash';
import FirebaseRefs from '../FirebaseRefs';
import { documentAs, documentsAs } from '../types';
import { ObserveOrdersOptions } from './types';

export const OngoingOrdersStatuses: OrderStatus[] = [
  'confirming',
  'confirmed',
  'preparing',
  'ready',
  'dispatching',
];

export default class OrderApi {
  constructor(private refs: FirebaseRefs) {}

  // callables
  // consumer
  async createFoodOrder(
    business: WithId<Business>,
    consumer: WithId<ConsumerProfile>,
    items: OrderItem[] = [],
    destination: Place | null = null
  ) {
    const payload: Order = {
      type: 'food',
      status: 'quote',
      business: {
        id: business.id,
        name: business.name,
      },
      consumer: {
        id: consumer.id,
        name: consumer.name ?? '',
      },
      origin: {
        address: {
          main: `${business.businessAddress!.address}, ${business.businessAddress!.number}`,
          secondary: `${business.businessAddress!.city}`,
          description: `${business.businessAddress!.address}, ${
            business.businessAddress!.number
          } - ${business.businessAddress!.city}`,
        },
      },
      destination,
      createdOn: firebase.firestore.FieldValue.serverTimestamp(),
      items,
    };
    const order = await this.refs.getOrdersRef().add(payload);
    return documentAs<Order>(await order.get());
  }
  async updateFoodOrder(orderId: string, changes: Partial<Order>) {
    await this.refs.getOrderRef(orderId).update(changes);
  }
  async createOrderP2P(consumer: WithId<ConsumerProfile>, origin: Place) {
    const payload: Order = {
      type: 'p2p',
      status: 'quote',
      consumer: {
        id: consumer.id,
        name: consumer.name ?? '',
      },
      origin,
      createdOn: firebase.firestore.FieldValue.serverTimestamp(),
    };
    const order = await this.refs.getOrdersRef().add(payload);
    return documentAs<Order>(await order.get());
  }

  async getOrderQuotes(orderId: string) {
    return (await this.refs.getGetOrderQuotesCallable()({ orderId })).data as Fare[];
  }

  async placeOrder(payload: PlaceOrderPayload) {
    return (await this.refs.getPlaceOrderCallable()(payload)).data;
  }

  async cancelOrder(orderId: string, cancellation?: OrderIssue) {
    return (await this.refs.getCancelOrderCallable()({ orderId, cancellation })).data;
  }

  async tipCourier(orderId: string, tip: number) {
    return (await this.refs.getTipCourierCallable()({ orderId, tip })).data;
  }

  async sendOrderProblem(orderId: string, problem: OrderIssue) {
    return (await this.refs.getSendOrderProblemCallable()({ orderId, problem })).data;
  }

  async sendCourierReview(orderId: string, review: Review) {
    return (await this.refs.getSendCourierReviewCallable()({ orderId, review })).data;
  }

  // courier
  async matchOrder(orderId: string) {
    return (await this.refs.getMatchOrderCallable()({ orderId })).data;
  }

  async rejectOrder(orderId: string, rejection: OrderRejection) {
    return (await this.refs.getRejectOrderCallable()({ orderId, rejection })).data;
  }

  async nextDispatchingState(orderId: string) {
    return (await this.refs.getNextDispatchingStateCallable()({ orderId })).data;
  }

  async completeDelivery(orderId: string) {
    return (await this.refs.getCompleteDeliveryCallable()({ orderId })).data;
  }

  async sendCourierOrderProblem(orderId: string, problem: OrderIssue) {
    return (await this.refs.getSendCourierOrderProblemCallable()({ orderId, problem })).data;
  }

  // firestore
  // both courier & customers
  observeOrders(
    options: ObserveOrdersOptions,
    resultHandler: (orders: WithId<Order>[]) => void
  ): firebase.Unsubscribe {
    const { consumerId, courierId, statuses, limit, businessId } = options;
    let query = this.refs.getOrdersRef().orderBy('createdOn', 'desc');

    if (!isEmpty(statuses)) query = query.where('status', 'in', statuses);
    if (consumerId) query = query.where('consumer.id', '==', consumerId);
    if (courierId) query = query.where('courier.id', '==', courierId);
    if (limit) query = query.limit(limit);
    if (businessId) query = query.where('business.id', '==', businessId);
    const unsubscribe = query.onSnapshot(
      (querySnapshot) => resultHandler(documentsAs<Order>(querySnapshot.docs)),
      (error) => console.error(error)
    );
    // returns the unsubscribe function
    return unsubscribe;
  }
  observeOrder(
    orderId: string,
    resultHandler: (orders: WithId<Order>) => void
  ): firebase.Unsubscribe {
    const unsubscribe = this.refs.getOrderRef(orderId).onSnapshot(
      (snapshot) => resultHandler(documentAs<Order>(snapshot)),
      (error) => console.error(error)
    );
    // returns the unsubscribe function
    return unsubscribe;
  }
  // observe order's chat
  observeOrderChat(
    orderId: string,
    resultHandler: (orders: WithId<ChatMessage>[]) => void
  ): firebase.Unsubscribe {
    const unsubscribe = this.refs
      .getOrderChatRef(orderId)
      .orderBy('timestamp', 'asc')
      .onSnapshot(
        (querySnapshot) => resultHandler(documentsAs<ChatMessage>(querySnapshot.docs)),
        (error) => console.error(error)
      );
    // returns the unsubscribe function
    return unsubscribe;
  }

  async sendMessage(orderId: string, message: Partial<ChatMessage>) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    return this.refs.getOrderChatRef(orderId).add({
      ...message,
      timestamp,
    });
  }

  async fetchIssues(type: IssueType) {
    const query = this.refs.getIssuesRef().where('type', '==', type);
    const docs = (await query.get()).docs;
    return documentsAs<Issue>(docs);
  }

  async fetchCuisines() {
    const query = this.refs.getCuisinesRef();
    const docs = (await query.get()).docs;
    return documentsAs<Cuisine>(docs);
  }

  async deleteOrder(orderId: string) {
    return this.refs.getOrderRef(orderId).delete();
  }
}
