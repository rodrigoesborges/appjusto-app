import Slider from '@react-native-community/slider';
import React, { useCallback, useRef, useState } from 'react';
import { View, Image, Text } from 'react-native';

import * as icons from '../../../../../assets/icons';
import { t } from '../../../../../strings';
import { colors, texts, padding } from '../../../../common/styles';

type Props = {
  acceptHandler: () => void;
  rejectHandler: () => void;
  disabled: boolean;
};

export default function ({ acceptHandler, rejectHandler, disabled }: Props) {
  // refs
  const sliderRef = useRef<Slider>(null);
  // helpers
  const updateSliderValue = (value: number) => sliderRef.current?.setNativeProps({ value });
  // handlers
  const completeHandler = useCallback((value) => {
    console.log(value);
    if (value <= 10) {
      updateSliderValue(0);
      rejectHandler();
    } else if (value >= 90) {
      updateSliderValue(100);
      acceptHandler();
    } else {
      updateSliderValue(50);
    }
  }, []);

  // UI
  return (
    <View>
      {/* track */}
      <View
        style={{
          position: 'absolute',
          height: 96,
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 64,
          backgroundColor: colors.lightGrey,
          paddingHorizontal: padding * 2,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Image source={icons.reject} width={24} height={24} />
          <Text style={[texts.default, { color: colors.darkGrey }]}>{t('Recusar')}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Image source={icons.accept} width={24} height={24} />
          <Text style={[texts.default]}>{t('Aceitar')}</Text>
        </View>
      </View>
      <Slider
        ref={sliderRef}
        disabled={disabled}
        style={{ width: '100%', height: 40, marginTop: 28 }}
        minimumValue={0}
        maximumValue={100}
        step={1}
        minimumTrackTintColor="#00000000"
        maximumTrackTintColor="#00000000"
        thumbImage={icons.motocycle}
        value={50}
        onSlidingComplete={completeHandler}
      />
    </View>
  );
}