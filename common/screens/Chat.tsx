import { RouteProp } from '@react-navigation/native';
import { ChatMessage, WithId } from 'appjusto-types';
import React, { useState, useCallback, useContext, useMemo, useEffect } from 'react';
import { View, Text } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';

import { t } from '../../strings';
import { ApiContext, AppDispatch } from '../app/context';
import DefaultButton from '../components/buttons/DefaultButton';
import PaddedView from '../components/containers/PaddedView';
import RoundedProfileImg from '../components/icons/RoundedProfileImg';
import DefaultInput from '../components/inputs/DefaultInput';
import { markMessageAsRead, sendMessage } from '../store/order/actions';
import { getOrderById, getOrderChat, groupOrderChatMessages } from '../store/order/selectors';
import { getUser } from '../store/user/selectors';
import { screens, colors, padding, texts, borders } from '../styles';
import { formatTime } from '../utils/formatters';

export type ChatParamList = {
  Chat: {
    orderId: string;
  };
};

type ScreenRoute = RouteProp<ChatParamList, 'Chat'>;

type Props = {
  route: ScreenRoute;
};

export default function ({ route }: Props) {
  // context
  const api = useContext(ApiContext);
  const dispatch = useDispatch<AppDispatch>();
  const { orderId } = route.params;

  // app state
  const user = useSelector(getUser)!;
  const order = useSelector(getOrderById)(orderId);
  const names = {
    [order.courier!.id]: order.courier!.name,
    [order.consumer!.id]: order.consumer!.name ?? t('Cliente'),
  };

  // screen state
  const [inputText, setInputText] = useState('');
  const messages = useSelector(getOrderChat)(orderId);
  const groupedMessages = useMemo(() => groupOrderChatMessages(messages), [messages]);

  // handlers
  const sendMessageHandler = useCallback(async () => {
    dispatch(sendMessage(api)(order, user.uid, inputText.trim()));
    setInputText('');
  }, [order, inputText]);
  useEffect(() => {
    if (messages.length > 0) {
      dispatch(markMessageAsRead(orderId, messages[messages.length - 1]));
    }
  }, [messages]);
  // UI
  return (
    <View style={[screens.default]}>
      <KeyboardAwareFlatList
        data={groupedMessages}
        keyExtractor={(item) => item.id}
        style={{ backgroundColor: colors.darkGrey }}
        renderItem={({ item }) => (
          <PaddedView
            style={{
              backgroundColor: colors.lightGrey,
              borderTopColor: colors.grey,
              borderTopWidth: 1,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RoundedProfileImg
                flavor={item.from === order.courier!.id ? 'courier' : 'consumer'}
                id={item.from}
              />
              <View style={{ marginLeft: padding / 2 }}>
                <Text style={[texts.medium]}>{names[item.from]}</Text>
              </View>
            </View>
            {item.messages.map((message: WithId<ChatMessage>) => (
              <PaddedView
                key={message.id}
                style={{
                  backgroundColor: colors.white,
                  ...borders.default,
                  marginTop: padding / 2,
                  alignSelf: 'flex-start',
                }}
                padding={12}
              >
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <Text style={[texts.small, { flexWrap: 'wrap' }]}>{message.message}</Text>
                  <Text style={[texts.tiny, { marginLeft: padding / 2, alignSelf: 'flex-end' }]}>
                    {message.timestamp
                      ? formatTime((message.timestamp as firebase.firestore.Timestamp).toDate())
                      : ''}
                  </Text>
                </View>
              </PaddedView>
            ))}
          </PaddedView>
        )}
        inverted
      />

      <PaddedView style={{ backgroundColor: colors.white }}>
        <DefaultInput
          value={inputText}
          placeholder={t('Escreva sua mensagem')}
          onChangeText={setInputText}
          multiline
          numberOfLines={3}
          onSubmitEditing={sendMessageHandler}
          blurOnSubmit
        >
          <DefaultButton
            style={{ marginLeft: padding }}
            title={t('Enviar')}
            onPress={sendMessageHandler}
            disabled={inputText.length === 0}
          />
        </DefaultInput>
      </PaddedView>
    </View>
  );
}
