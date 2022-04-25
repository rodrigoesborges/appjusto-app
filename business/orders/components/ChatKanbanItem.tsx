import React from 'react';
import { Text, View } from 'react-native';
import DefaultButton from '../../../common/components/buttons/DefaultButton';
import RoundedText from '../../../common/components/texts/RoundedText';
import { useObserveOrder } from '../../../common/store/api/order/hooks/useObserveOrder';
import { borders, colors, padding, texts } from '../../../common/styles';
import { t } from '../../../strings';
import { OrderChatGroup } from '../../hooks/useBusinessChats';

type Props = {
  chat: OrderChatGroup;
  onCheckOrder: () => void;
  onOpenChat: () => void;
};

export const ChatKanbanItem = ({ chat, onCheckOrder, onOpenChat }: Props) => {
  // screen state
  const order = useObserveOrder(chat.orderId);
  // helpers
  const newMessage = chat.counterParts[0].unreadMessages?.length;
  const getMessageFlavor = (() => {
    if (chat.counterParts[0].flavor === 'consumer') return t('Cliente');
    if (chat.counterParts[0].flavor === 'courier') return t('Entregador');
    else return t('AppJusto');
  })();
  const flavors = chat.counterParts[0].flavor === 'consumer';
  // UI
  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: padding,
        ...borders.default,
        backgroundColor: colors.white,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* TODO: if there is a new message, there should be a red circle to the left of this RoundedText */}
        <RoundedText backgroundColor={colors.grey50} color={colors.black} noBorder>
          {getMessageFlavor}
        </RoundedText>
        <Text style={{ ...texts.x2s }}>ENVIADO ÀS 00h00</Text>
      </View>
      <View style={{ marginVertical: padding }}>
        <Text style={{ ...texts.sm }}>{order?.consumer.name}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ width: '38%' }}>
          <DefaultButton secondary title={t('Ver pedido')} onPress={onCheckOrder} />
        </View>
        <View style={{ width: '57%' }}>
          <DefaultButton
            title={newMessage ? t('Nova mensagem') : t('Abrir chat')}
            grey={!newMessage}
            onPress={onOpenChat}
          />
        </View>
      </View>
    </View>
  );
};
