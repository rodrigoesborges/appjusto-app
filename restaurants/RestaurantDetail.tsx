import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { View, Image, Text, TouchableOpacity, ActivityIndicator, SectionList } from 'react-native';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

import { ApiContext } from '../common/app/context';
import { useOrderedMenu } from '../common/common-logic/useOrderedMenu';
import { getUser } from '../common/store/user/selectors';
import { colors, halfPadding, padding, screens, texts } from '../common/styles';
import { formatDistance, formatDuration, separateWithDot } from '../common/utils/formatters';
import { HomeNavigatorParamList } from '../consumer/home/types';
import { t } from '../strings';
import SingleHeader from './SingleHeader';
import * as fake from './fakeData';

type ScreenNavigationProp = StackNavigationProp<HomeNavigatorParamList>;
type ScreenRouteProp = RouteProp<HomeNavigatorParamList, 'RestaurantDetail'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function ({ navigation, route }: Props) {
  const { restaurantId, restaurantName } = route.params ?? {};
  // context
  const api = useContext(ApiContext);

  // app state
  const user = useSelector(getUser)!;

  const restaurantQuery = (key: string, restaurantId: string) =>
    api.menu().getRestaurant(restaurantId);
  const { data: restaurant } = useQuery(['restaurant', restaurantId], restaurantQuery);

  const orderedMenu = useOrderedMenu(restaurantId);
  console.log(orderedMenu);

  const sections = [{ data: orderedMenu }];

  // setting the restaurant name on the header as soon as the user navigates to the screen
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: restaurantName,
    });
  }, [route.params]);

  //UI
  const RestaurantCard = () => (
    <View style={{ marginHorizontal: 12 }}>
      <Image source={fake.card} style={{ height: 120, width: '100%', borderRadius: 8 }} />
      <View
        style={{
          flexDirection: 'row',
          marginTop: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ ...texts.mediumToBig }}>{restaurant?.name}</Text>
          <Text style={{ ...texts.small, color: colors.darkGreen }}>{t('Tipo de comida')}</Text>
          <Text style={{ ...texts.small, color: colors.darkGrey }}>
            {separateWithDot(formatDistance(2000), formatDuration(1800))}
          </Text>
        </View>
        <View>
          <Image source={fake.cardIcon} />
        </View>
      </View>
    </View>
  );

  const RestaurantItem = ({ name, description, price, onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          borderBottomWidth: 1,
          borderStyle: 'solid',
          width: '100%',
          borderColor: colors.grey,
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingLeft: padding,
          paddingRight: halfPadding,
          marginVertical: halfPadding,
        }}
      >
        <View style={{ width: '60%' }}>
          <Text style={{ ...texts.default }}>{name}</Text>
          <Text style={{ ...texts.small, color: colors.darkGrey }} numberOfLines={2}>
            {description}
          </Text>
          <Text style={{ ...texts.default }}>{price}</Text>
        </View>
        <View>
          <Image source={fake.itemRectangle} style={{ height: 96, width: 96, borderRadius: 8 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
  if (!restaurant)
    return (
      <View style={screens.centered}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  return (
    <SectionList
      style={{ ...screens.default }}
      data={orderedMenu}
      keyExtractor={(item) => item.id}
      sections={sections}
      ListHeaderComponent={
        <View>
          <RestaurantCard />
        </View>
      }
      renderItem={({ item, index }) => {
        const category = orderedMenu[index];
        return (
          <View>
            <SingleHeader title={category.name} />
            {orderedMenu.map((category, i) => (
              <RestaurantItem
                key={category.products[i].id}
                name={category.products[i].name}
                description={category.products[i].description}
                price={category.products[i].price}
                onPress={() => navigation.navigate('ItemDetail')}
              />
            ))}
          </View>
        );
      }}
    />
  );
}
