import { Order } from 'appjusto-types';
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

import ArrowBox from '../../common/components/ArrowBox';
import { colors, texts, borders, padding } from '../../common/styles';
import { t } from '../../strings';
import StatusBadge from './StatusBadge';

type Props = {
  order: Order;
  onPress: () => void;
};

export default function ({ order, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ padding, borderBottomColor: colors.grey, borderBottomWidth: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ ...borders.default }}>
            <Text style={{ ...texts.default }}>{order.origin.address?.description}</Text>
            <Text style={{ ...texts.default, color: colors.darkGrey }}>{t('Pedido No 1')}</Text>
            <Text style={{ ...texts.default, color: colors.darkGrey }}>
              {t('10/07/2020 - 12h30')}
            </Text>
          </View>
          <ArrowBox />
        </View>
        <StatusBadge status={order.status} />
      </View>
    </TouchableOpacity>
  );
}
