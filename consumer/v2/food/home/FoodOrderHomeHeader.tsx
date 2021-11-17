import { ConsumerProfile, Cuisine, WithId } from '@appjusto/types';
import React from 'react';
import { Image, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import * as icons from '../../../../assets/icons';
import DoubleHeader from '../../../../common/components/texts/DoubleHeader';
import { IconLogin } from '../../../../common/icons/icon-login';
import HomeCard from '../../../../common/screens/home/cards/HomeCard';
import { borders, colors, halfPadding, padding, texts } from '../../../../common/styles';
import { t } from '../../../../strings';
import { CuisineSelector } from './CuisineSelector';
import { LocationBar } from './LocationBar';

type Props = {
  selectedCuisineId?: string;
  onChangePlace: () => void;
  onSearchPress: () => void;
  onCuisineSelect: (cuisine: WithId<Cuisine> | null) => void;
  consumer: WithId<ConsumerProfile> | undefined;
  onLogin: () => void;
};

export const FoodOrderHomeHeader = ({
  selectedCuisineId,
  onChangePlace,
  onSearchPress,
  onCuisineSelect,
  consumer,
  onLogin,
}: Props) => {
  return (
    <View>
      <View style={{ paddingTop: 12, paddingHorizontal: 12 }}>
        <LocationBar onChangePlace={onChangePlace} />
      </View>
      {/* login */}
      {!consumer ? (
        <TouchableOpacity onPress={onLogin} style={{ marginTop: 24, paddingHorizontal: padding }}>
          <HomeCard
            icon={<IconLogin />}
            title={t('Crie uma conta ou faça o login')}
            subtitle={t('Você precisa estar logado para pedir')}
            // grey
          />
        </TouchableOpacity>
      ) : null}
      {/* search */}
      <View style={{ paddingTop: halfPadding }}>
        <DoubleHeader
          title={t('Já sabe o que quer?')}
          subtitle={t('Então vai direto no seu prato ou restaurante preferido')}
        />
      </View>
      <View style={{ marginTop: 24, paddingHorizontal: 12, marginBottom: halfPadding }}>
        <TouchableWithoutFeedback onPress={onSearchPress}>
          <View>
            <View
              style={{
                height: 60,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 12,
                ...borders.default,
                borderColor: colors.black,
              }}
            >
              <Text style={{ ...texts.sm, color: colors.grey700 }}>
                {t('Buscar por prato ou restaurante')}
              </Text>
              <Image source={icons.search} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
      {/* by cuisine */}
      <CuisineSelector
        selectedCuisineId={selectedCuisineId}
        onSelect={(cuisine) => onCuisineSelect(cuisine)}
      />
    </View>
  );
};
