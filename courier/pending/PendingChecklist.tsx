import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { ApiContext, AppDispatch } from '../../common/app/context';
import ConfigItem from '../../common/components/ConfigItem';
import DefaultButton from '../../common/components/buttons/DefaultButton';
import PaddedView from '../../common/components/views/PaddedView';
import {
  submitProfile,
  getDocumentImageURL,
  getSelfieURL,
} from '../../common/store/courier/actions';
import { getCourier } from '../../common/store/courier/selectors';
import { getUIBusy } from '../../common/store/ui/selectors';
import { screens, texts, colors } from '../../common/styles';
import { t } from '../../strings';
import { PendingParamList } from './types';

type ScreenNavigationProp = StackNavigationProp<PendingParamList, 'PendingChecklist'>;
type ScreenRouteProp = RouteProp<PendingParamList, 'PendingChecklist'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function ({ navigation, route }: Props) {
  // context
  const api = useContext(ApiContext);
  const dispatch = useDispatch<AppDispatch>();

  // app state
  const busy = useSelector(getUIBusy);
  const courier = useSelector(getCourier);
  const situation = courier!.situation ?? 'pending';

  // screen state
  const [hasImagesUris, setHasImagesUris] = useState(false);
  const submitEnabled =
    situation === 'pending' &&
    courier!.personalInfoSet() &&
    courier!.bankAccountSet() &&
    hasImagesUris;

  // handlers
  const submitHandler = async () => {
    await dispatch(submitProfile(api));
  };

  // side effects
  useEffect(() => {
    const feedbackSituations = ['blocked', 'rejected', 'submitted'];
    if (feedbackSituations.indexOf(situation) > -1) {
      navigation.navigate('ProfileFeedback');
    }
  }, [situation]);

  useEffect(() => {
    navigation.addListener('focus', focusHandler);
    return () => navigation.removeListener('focus', focusHandler);
  }, []);

  // handler
  const focusHandler = useCallback(() => {
    (async () => {
      try {
        const documentImageUri = await dispatch(getDocumentImageURL(api)(courier!.id!));
        const selfieUri = await dispatch(getSelfieURL(api)(courier!.id!));
        setHasImagesUris(documentImageUri !== null && selfieUri !== null);
      } catch (error) {}
    })();
  }, []);

  // UI
  return (
    <View style={{ ...screens.configScreen }}>
      <ScrollView>
        {/* header */}
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <PaddedView>
            <Text style={[texts.big]}>{t('Cadastro de novo entregador')}</Text>
            <DefaultButton
              title={t('Enviar cadastro')}
              onPress={submitHandler}
              disabled={!submitEnabled || busy}
              activityIndicator={busy}
            />
            <Text style={[texts.default, { color: colors.darkGrey, paddingTop: 8 }]}>
              {t(
                'Seu cadastro passará por uma análise do nosso sistema para que você possa começar a fazer suas entregas.'
              )}
            </Text>
          </PaddedView>
        </TouchableWithoutFeedback>

        <PaddedView>
          <ConfigItem
            title={t('Seus dados')}
            subtitle={t('Preencha seus dados pessoais')}
            onPress={() => navigation.navigate('ProfileEdit', { allowPartialSave: false })}
            checked={courier!.personalInfoSet()}
          />
          <ConfigItem
            title={t('Fotos e documentos')}
            subtitle={t('Envie uma selfie e seus documentos')}
            onPress={() => navigation.navigate('ProfilePhotos')}
            checked={hasImagesUris}
          />
          <ConfigItem
            title={t('Dados bancários')}
            subtitle={t('Cadastre seu banco para recebimento')}
            onPress={() => navigation.navigate('Bank')}
            checked={courier!.bankAccountSet()}
          />
        </PaddedView>
      </ScrollView>
    </View>
  );
}