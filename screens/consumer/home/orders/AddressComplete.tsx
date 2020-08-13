import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import debounce from 'lodash/debounce';
import { nanoid } from 'nanoid/non-secure';
import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';

import { getEnv } from '../../../../store/config/selectors';
import { t } from '../../../../strings';
import { ApiContext } from '../../../app/context';
import DefaultButton from '../../../common/DefaultButton';
import DefaultInput from '../../../common/DefaultInput';
import { borders, texts, screens, colors } from '../../../common/styles';
import { HomeNavigatorParamList } from '../types';

type ScreenNavigationProp = StackNavigationProp<HomeNavigatorParamList, 'AddressComplete'>;
type ScreenRouteProp = RouteProp<HomeNavigatorParamList, 'AddressComplete'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function ({ navigation, route }: Props) {
  // context
  const api = useContext(ApiContext);
  const { params } = route;
  const { value: initialAddress, destinationScreen, destinationParam } = params;

  // state
  const dev = useSelector(getEnv) === 'development';
  const autocompleteSession = nanoid();
  const [address, setAddress] = useState(initialAddress);
  const [autocompletePredictions, setAutoCompletePredictions] = useState(
    dev
      ? [
          {
            description: 'Av. Paulista, 1578',
          },
          {
            description: 'Av. Paulista, 2424',
          },
          {
            description: 'Largo de São Bento',
          },
        ]
      : []
  );

  // handlers
  const getAddress = useCallback(
    debounce<(input: string) => void>(async (input: string): Promise<void> => {
      const { predictions } = await api.maps().googlePlacesAutocomplete(input, autocompleteSession);
      setAutoCompletePredictions(predictions);
    }, 1000),
    [autocompleteSession]
  );

  const textChangeHandler = useCallback(
    (text) => {
      setAddress(text);
      if (text.length > 5) {
        // TODO: define threshold
        getAddress(address);
      }
    },
    [address]
  );

  const completeHandler = useCallback(() => {
    navigation.navigate(destinationScreen, { [destinationParam]: address });
  }, [navigation, destinationScreen, address]);

  // UI
  return (
    <View style={{ ...screens.lightGrey, paddingTop: 16 }}>
      <DefaultInput
        defaultValue={initialAddress}
        value={address}
        title={t('Endereço de retirada')}
        placeholder={t('Endereço com número')}
        onChangeText={textChangeHandler}
        style={{ marginBottom: 32 }}
      />
      <Text style={{ ...texts.small, color: colors.darkGrey, marginBottom: 14 }}>
        {t('Últimos endereços utilizados')}
      </Text>
      <FlatList
        data={autocompletePredictions}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity onPress={() => setAddress(item.description)}>
              <View style={styles.item}>
                <Text style={{ ...texts.medium }}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.description}
      />
      <DefaultButton
        style={{ marginBottom: 16 }}
        title={t('Confirmar endereço')}
        onPress={completeHandler}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    width: '100%',
    height: 61,
    ...borders.default,
    justifyContent: 'center',
  },
});
