import { Order, WithId } from '@appjusto/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Print from 'expo-print';
import React from 'react';
import { Modal, ModalProps, Platform, Text, TouchableOpacity, View } from 'react-native';
import * as Sentry from 'sentry-expo';
import { ApiContext } from '../../../common/app/context';
import DefaultButton from '../../../common/components/buttons/DefaultButton';
import RadioButton from '../../../common/components/buttons/RadioButton';
import { track } from '../../../common/store/api/track';
import { borders, colors, halfPadding, padding, texts } from '../../../common/styles';
import { t } from '../../../strings';
import { BusinessAppContext } from '../../BusinessAppContext';
import { LoggedBusinessNavParamsList } from '../../types';
import { printedOrder } from '../../utils/printedOrder';

type ScreenNavigationProp = StackNavigationProp<LoggedBusinessNavParamsList, 'BusinessNavigator'>;

interface Props extends ModalProps {
  order: WithId<Order>;
  modalVisible: boolean;
  onModalClose: () => void;
  buttonTitle: string;
}

export const CookingTimeModal = ({ order, onModalClose, modalVisible, buttonTitle }: Props) => {
  // context
  const api = React.useContext(ApiContext);
  const navigation = useNavigation<ScreenNavigationProp>();
  const { business } = React.useContext(BusinessAppContext);
  // state
  const [cookingTime, setCookingTime] = React.useState<number | undefined | null>(
    order.cookingTime ?? business?.averageCookingTime ?? undefined
  );
  const [isLoading, setLoading] = React.useState(false);
  const [selectedPrinter, setSelectedPrinter] = React.useState<Print.Printer>();

  // print order
  const printOrder = async () => {
    if (!business) return;
    try {
      if (business.orderPrinting === true) {
        // selecting printer (ios only)
        if (Platform.OS === 'android') {
          const printer = await Print.selectPrinterAsync();
          setSelectedPrinter(printer);
        }
        await Print.printAsync({
          html: printedOrder(order),
          printerUrl: selectedPrinter?.url,
        });
      } else return;
    } catch (error) {
      console.log('PRINT ERROR', error);
    }
  };
  // handlers
  const confirmOrderHandler = async () => {
    try {
      setLoading(true);
      // if business has not confirmed order yet, set cooking time and set status to 'preparing'
      if (order.status === 'confirmed') {
        if (order.preparationMode === 'scheduled') {
          await api.order().updateOrder(order.id, { cookingTime, status: 'scheduled' });
        } else {
          await api.order().updateOrder(order.id, { cookingTime, status: 'preparing' });
          track('restaurant confirmed order');
          printOrder();
          setLoading(false);
          navigation.navigate('BusinessNavigator', { screen: 'BusinessOrders' });
        }
      }
      // if status === 'preparing' only set cooking time
      else {
        await api.order().updateOrder(order.id, { cookingTime });
      }
      setLoading(false);
      onModalClose();
    } catch (error) {
      setLoading(false);
      console.log(error);
      Sentry.Native.captureException(error);
    }
  };
  // UI
  return (
    <Modal transparent visible={modalVisible} animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}
      >
        <View
          style={{
            backgroundColor: colors.white,
            ...borders.default,
            paddingTop: padding,
            paddingBottom: halfPadding,
          }}
        >
          <View style={{ paddingHorizontal: padding, marginBottom: padding }}>
            <TouchableOpacity onPress={onModalClose}>
              <View
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}
              >
                <Text style={{ ...texts.xl }}>{t('Definir tempo de preparo')}</Text>
                <MaterialIcons name="close" size={20} />
              </View>
            </TouchableOpacity>
            <Text style={{ ...texts.sm, marginTop: padding, color: colors.grey700 }}>
              {t(
                'Ao definir o tempo de preparo, quando finalizado esse tempo, o pedido será automaticamente movido para ”Aguardando retirada”'
              )}
            </Text>
          </View>
          <View style={{ paddingHorizontal: padding }}>
            <RadioButton
              title={t('10 minutos')}
              onPress={() => setCookingTime(600)}
              checked={cookingTime === 600}
              style={{ marginBottom: padding }}
            />
            <RadioButton
              title={t('20 minutos')}
              onPress={() => setCookingTime(1200)}
              checked={cookingTime === 1200}
              style={{ marginBottom: padding }}
            />
            <RadioButton
              title={t('25 minutos')}
              onPress={() => setCookingTime(1500)}
              checked={cookingTime === 1500}
              style={{ marginBottom: padding }}
            />
            <RadioButton
              title={t('30 minutos')}
              onPress={() => setCookingTime(1800)}
              checked={cookingTime === 1800}
              style={{ marginBottom: padding }}
            />
            <RadioButton
              title={t('40 minutos')}
              onPress={() => setCookingTime(2400)}
              checked={cookingTime === 2400}
              style={{ marginBottom: padding }}
            />
            <RadioButton
              title={t('45 minutos')}
              onPress={() => setCookingTime(2700)}
              checked={cookingTime === 2700}
              style={{ marginBottom: padding }}
            />
            <RadioButton
              title={t('50 minutos')}
              onPress={() => setCookingTime(3000)}
              checked={cookingTime === 3000}
              style={{ marginBottom: padding }}
            />
            <RadioButton
              title={t('60 minutos')}
              onPress={() => setCookingTime(3600)}
              checked={cookingTime === 3600}
            />
          </View>
          <View
            style={{
              paddingTop: halfPadding,
              borderTopColor: colors.grey500,
              borderTopWidth: 1,
              marginTop: 24,
            }}
          >
            <View style={{ paddingHorizontal: padding }}>
              <DefaultButton
                title={buttonTitle}
                onPress={confirmOrderHandler}
                activityIndicator={isLoading}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
