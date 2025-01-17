import {
  ConsumerProfile,
  CourierProfile,
  Flavor,
  ManagerProfile,
  UserProfile,
  WithId,
} from '@appjusto/types';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import {
  doc,
  Firestore,
  GeoPoint,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { hash } from 'geokit';
import { Platform } from 'react-native';
import * as Sentry from 'sentry-expo';
import { getInstallationId } from '../../../utils/getInstallationId';
import AuthApi from '../auth';
import { fetchPublicIP } from '../externals/ipify';
import { documentAs } from '../types';

export default class ProfileApi {
  private collectionName: string;
  constructor(private firestore: Firestore, private auth: AuthApi, public flavor: Flavor) {
    this.collectionName =
      this.flavor === 'consumer'
        ? 'consumers'
        : this.flavor === 'courier'
        ? 'couriers'
        : 'managers';
  }

  // private helpers
  private getProfileRef(id: string) {
    return doc(this.firestore, this.collectionName, id);
  }
  private async createProfile(id: string) {
    console.log(`Creating ${this.flavor} profile...`);
    await setDoc(
      this.getProfileRef(id),
      {
        situation: 'pending',
        email: this.auth.getEmail() ?? null,
        phone: this.auth.getPhoneNumber(true) ?? null,
        createdOn: serverTimestamp(),
      } as UserProfile,
      { merge: true }
    );
  }

  // firestore
  // observe profile changes
  observeProfile(id: string, resultHandler: (profile: WithId<UserProfile>) => void): Unsubscribe {
    return onSnapshot(
      this.getProfileRef(id),
      async (snapshot) => {
        if (!snapshot.exists()) {
          const unsub = onSnapshot(
            this.getProfileRef(id),
            { includeMetadataChanges: true },
            (snapshotWithMetadata) => {
              if (!snapshotWithMetadata.metadata.hasPendingWrites) {
                resultHandler(documentAs<UserProfile>(snapshotWithMetadata));
                unsub();
              }
            }
          );
          await this.createProfile(id);
        } else resultHandler(documentAs<UserProfile>(snapshot));
      },
      (error) => {
        console.log('error');
        Sentry.Native.captureException(error);
      }
    );
  }

  // update profile
  async updateProfile(
    id: string,
    changes: Partial<CourierProfile> | Partial<ConsumerProfile> | Partial<ManagerProfile>,
    retry: number = 5
  ) {
    const appVersion = `${Application.nativeApplicationVersion}${
      Constants.manifest ? ` / ${Constants.manifest.version}` : ''
    }`;
    return new Promise<void>(async (resolve) => {
      const installationId = await getInstallationId();
      const ip = this.flavor === 'consumer' ? await fetchPublicIP() : null;
      const update: Partial<UserProfile> = {
        ...changes,
        appVersion,
        appInstallationId: installationId,
        appIp: ip,
        platform: Platform.OS,
        updatedOn: serverTimestamp(),
      };
      try {
        await setDoc(this.getProfileRef(id), update, { merge: true });
        resolve();
      } catch (error: any) {
        if (retry > 0) {
          setTimeout(async () => resolve(await this.updateProfile(id, changes, retry - 1)), 2000);
        } else {
          console.error('Erro ao tentar atualizar o perfil:', JSON.stringify(update));
          console.error(error);
          // Sentry.Native.captureException(error);
          resolve();
        }
      }
    });
  }

  async updateLocation(id: string, location: GeoPoint, retry: number = 5) {
    const update: Partial<UserProfile> = {
      coordinates: location,
      g: {
        geopoint: location,
        geohash: hash({
          lat: location.latitude,
          lng: location.longitude,
        }),
      },
      updatedOn: serverTimestamp(),
    };
    console.log(id, update);
    await this.updateProfile(id, update);
  }
}
