import firebase from 'firebase';

import { City, Fleet } from '../fleet/types';

export default class FleetApi {
  constructor(
    private firestore: firebase.firestore.Firestore,
    private functions: firebase.functions.Functions
  ) {}

  // firestore
  // fetch available cities
  async fetchAvailableCities() {
    const querySnapshot = await this.firestore
      .collection('config')
      .doc('cities')
      .collection('available')
      .get();
    const docs: City[] = [];
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        docs.push({ ...(doc.data() as City), id: doc.id });
      });
    }
    return docs;
  }
  // fetch all cities
  async fetchAllCities() {
    const querySnapshot = await this.firestore
      .collection('config')
      .doc('cities')
      .collection('all')
      .get();
    const docs: City[] = [];
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        docs.push({ ...(doc.data() as City), id: doc.id });
      });
    }
    return docs;
  }

  // fetch available fleets
  async fetchApprovedFleets(cityId: string) {
    const querySnapshot = await this.firestore
      .collection('fleets')
      .where('situation', '==', 'approved')
      .where('city.id', '==', cityId)
      .orderBy('totalParticipants', 'desc')
      .get();
    const docs: Fleet[] = [];
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        docs.push({ ...(doc.data() as Fleet), id: doc.id });
      });
    }
    return docs;
  }
}
