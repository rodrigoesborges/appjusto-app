import { IuguMarketplaceAccountReceivableItem } from '@appjusto/types/payment/iugu';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import DefaultButton from '../../../../../common/components/buttons/DefaultButton';
import PaddedView from '../../../../../common/components/containers/PaddedView';
import { useMarketplaceAccountInfo } from '../../../../../common/store/api/courier/account/useMarketplaceAccountInfo';
import { useSegmentScreen } from '../../../../../common/store/api/track';
import {
  borders,
  colors,
  halfPadding,
  padding,
  screens,
  texts,
} from '../../../../../common/styles';
import { formatCurrency } from '../../../../../common/utils/formatters';
import { t } from '../../../../../strings';
import { DeliveriesNavigatorParamList } from '../types';
import { useCanAdvanceReceivables } from './useCanAdvanceReceivables';

type ScreenNavigationProp = StackNavigationProp<DeliveriesNavigatorParamList, 'Receivables'>;
type ScreenRoute = RouteProp<DeliveriesNavigatorParamList, 'Receivables'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRoute;
};

interface Section {
  advanceable: boolean;
  data: IuguMarketplaceAccountReceivableItem[];
}

export const Receivables = ({ navigation, route }: Props) => {
  // context
  const info = useMarketplaceAccountInfo();
  // state
  const canAdvanceReceivables = useCanAdvanceReceivables();
  // side effects
  useSegmentScreen('Receivables');
  // handlers
  const advanceHandler = () => {
    navigation.replace('AdvanceReceivables');
  };
  // UI
  if (!info) {
    return (
      <View style={screens.centered}>
        <ActivityIndicator size="large" color={colors.green500} />
      </View>
    );
  }
  return (
    <ScrollView
      style={{ ...screens.config }}
      contentContainerStyle={{ flexGrow: 1 }}
      scrollIndicatorInsets={{ right: 1 }}
    >
      <PaddedView>
        <PaddedView
          style={{
            width: '100%',
            borderRadius: padding,
            backgroundColor: colors.darkYellow,
            justifyContent: 'center',
            marginBottom: padding,
          }}
        >
          <Text style={[texts.sm, texts.bold]}>
            {t(
              'Desde o dia 11/10/2022, os valores dos pedidos entregues já ficam disponíveis na sua conta 24 horas depois da corrida, não sendo mais necessário fazer antecipação.'
            )}
          </Text>
          <Text style={[texts.sm]}>
            {t(
              'Você poderá continuar utilizando o fluxo normal de antecipações para corridas realizadas antes do dia 11/10/2022 que foram pagas com cartão de crédito.'
            )}
          </Text>
        </PaddedView>
        <Text style={{ ...texts.sm }}>
          {t(
            'O AppJusto não fica com nada do valor do seu trabalho. Todos os pagamentos são processados com segurança pela operadora financeira Iugu.'
          )}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: padding,
            marginTop: 24,
          }}
        >
          <Feather name="info" size={14} />
          <Text style={{ ...texts.md, marginLeft: halfPadding }}>{t('Como funciona')}</Text>
        </View>
        <Text style={{ ...texts.sm, paddingBottom: halfPadding }}>
          {t(
            'O valor a antecipar pode variar de acordo com o valor solicitado. Isso acontece por que a Iugu seleciona o conjunto de faturas, priorizando aquelas mais próximas de sua data de compensação, em que a soma de seus valores se aproxima ao máximo do valor solicitado.'
          )}
        </Text>
        <Text style={{ ...texts.sm, paddingBottom: halfPadding }}>
          {t(
            'O prazo padrão para processar os pagamentos é de 30 dias. Para antecipar, você paga uma taxa de até 2.75% por operação. Funciona assim: se for antecipar no primeiro dia útil após a corrida, você pagará o valor cheio de 2.75%, e a taxa diminui proporcionalmente a cada dia que passa. Se você esperar 15 dias, por exemplo, pagará 1,37% (metade dos 2,75%).'
          )}
        </Text>
        <Text style={{ ...texts.sm, color: colors.red }}>
          {t(
            'Atenção: a Iugu só permite realizar antecipações em dias úteis, de 09:00 às 16:00 e só é possível antecipar faturas pagas há mais de 2 dias úteis.'
          )}
        </Text>
        <PaddedView
          style={{
            backgroundColor: colors.white,
            ...borders.default,
            borderColor: colors.white,
            marginTop: padding,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.grey700} />
            <Text style={{ ...texts.sm, color: colors.grey700, marginLeft: halfPadding }}>
              {t('Total a antecipar')}
            </Text>
          </View>
          <Text style={{ ...texts.x4l }}>{formatCurrency(info.advanceable_value)}</Text>
        </PaddedView>
      </PaddedView>
      <View style={{ flex: 1 }} />
      <PaddedView>
        <DefaultButton
          title={canAdvanceReceivables ? t('Simular antecipação') : t('Fora do horário')}
          onPress={advanceHandler}
          disabled={!canAdvanceReceivables || info.advanceable_value === 0}
        />
      </PaddedView>
    </ScrollView>
  );
};
