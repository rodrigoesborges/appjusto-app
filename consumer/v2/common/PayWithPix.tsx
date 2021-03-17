import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { pix } from '../../../assets/icons';
import CheckField from '../../../common/components/buttons/CheckField';
import DefaultButton from '../../../common/components/buttons/DefaultButton';
import PaddedView from '../../../common/components/containers/PaddedView';
import DefaultInput from '../../../common/components/inputs/DefaultInput';
import Pill from '../../../common/components/views/Pill';
import useObserveOrder from '../../../common/store/api/order/hooks/useObserveOrder';
import { getConsumer } from '../../../common/store/consumer/selectors';
import { borders, colors, padding, screens, texts } from '../../../common/styles';
import { t } from '../../../strings';

export type PixParamList = {
  PayWithPix: {
    orderId: string;
  };
};

type ScreenNavigationProp = StackNavigationProp<PixParamList, 'PayWithPix'>;
type ScreenRouteProp = RouteProp<PixParamList, 'PayWithPix'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export const PayWithPix = ({ navigation, route }: Props) => {
  const { orderId } = route.params;
  // redux store
  const consumer = useSelector(getConsumer)!;
  // state
  const { order } = useObserveOrder(orderId);
  // screen state
  const [cpfKey, setCpfKey] = React.useState(false);
  const [pixValue, setPixValue] = React.useState('');
  // for tests only
  const [newScreen, setNewScreen] = React.useState(false);
  // side-effects
  // setting consumer cpf as pix key
  React.useEffect(() => {
    if (!cpfKey) setPixValue('');
    if (cpfKey) setPixValue(consumer.cpf!);
  }, [cpfKey, consumer.cpf]);

  return !newScreen ? (
    <View style={{ ...screens.config }}>
      <PaddedView style={{ flex: 1 }}>
        <Image source={pix} />
        <Text style={{ ...texts.lg, marginTop: padding }}>{t('Informe sua chave')}</Text>
        <Text style={{ ...texts.sm, marginVertical: padding, color: colors.grey700 }}>
          {t(
            'É importante informar a sua chave para enviarmos o estorno do valor caso ocorra algum problema no pedido.'
          )}
        </Text>
        <DefaultInput title={t('Chave Pix')} value={pixValue} onChangeText={setPixValue} />
        {consumer.cpf && (
          <CheckField
            checked={cpfKey}
            onPress={() => setCpfKey(!cpfKey)}
            text={t('Usar CPF como chave')}
            style={{ marginTop: padding }}
          />
        )}
      </PaddedView>
      <View style={{ flex: 1 }} />
      <View
        style={{
          backgroundColor: colors.white,
          paddingTop: padding,
          paddingRight: padding,
          // flex: 1,
          paddingBottom: 32,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pill />
            <Text style={{ ...texts.md, marginLeft: 12 }}>{t('Valor total a pagar')}</Text>
          </View>
          <Text style={{ ...texts.xl }}>{t('R$ 10,00')}</Text>
        </View>
        <View style={{ marginTop: padding, marginHorizontal: padding }}>
          <Text
            style={{
              ...texts.xs,
              color: colors.grey700,
              marginBottom: padding,
            }}
          >
            {t(
              'Você poderá deixar uma Caixinha de gorjeta para o entregador quando o seu pedido for entregue.'
            )}
          </Text>
          <DefaultButton
            title={t('Gerar código de pagamento Pix')}
            onPress={() => setNewScreen(true)}
          />
        </View>
      </View>
    </View>
  ) : (
    <View style={{ ...screens.config }}>
      <PaddedView style={{ flex: 1 }}>
        <Image source={pix} />
        <Text style={{ ...texts.lg, marginTop: padding }}>{t('Efetue o pagamento')}</Text>
        <Text style={{ ...texts.sm, marginVertical: padding, color: colors.grey700 }}>
          {t(
            'Se você vai pagar com este mesmo dispositivo clique no botão Copiar chave de pagamento'
          )}
        </Text>
        <Text style={{ ...texts.sm, marginBottom: padding, color: colors.grey700 }}>
          {t(
            'Depois, acesse o aplicativo do seu banco ou instituição financeira na seção Pix e procure a função Pix Copia e Cola'
          )}
        </Text>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ width: '49%' }}>
            <View style={{ ...borders.default, height: 156, width: 156 }} />
          </View>
          <View style={{ width: '49%' }}>
            <Text style={{ ...texts.sm, color: colors.grey700 }}>
              {t(
                'Você ou outra pessoa também podem efetuar o pagamento através do QR Code ao lado'
              )}
            </Text>
          </View>
        </View>
        <DefaultButton
          title={t('Copiar chave de pagamento')}
          style={{ marginTop: padding }}
          onPress={() => setNewScreen(false)}
        />
      </PaddedView>
      <View
        style={{
          backgroundColor: colors.white,
          paddingTop: padding,
          paddingRight: padding,
          // flex: 1,
          paddingBottom: 32,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pill />
          <Text style={{ ...texts.md, marginLeft: 12 }}>{t('Importante')}</Text>
        </View>

        <View style={{ marginTop: padding, marginHorizontal: padding }}>
          <Text
            style={{
              ...texts.xs,
              color: colors.grey700,
              marginBottom: padding,
            }}
          >
            {t(
              'Após realizar o pagamento na sua instituição financeira, confirme o pagamento aqui.'
            )}
          </Text>
          <DefaultButton
            title={t('Confirmar pagamento')}
            onPress={() => null}
            disabled={newScreen}
            style={{ backgroundColor: colors.grey700 }}
          />
        </View>
      </View>
    </View>
  );
};