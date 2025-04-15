import React from 'react';
import { View, StyleSheet } from 'react-native';
import TabNavigator from '../navigation/TabNavigator';
import { useNavigation, NavigationContainer, useIsFocused } from '@react-navigation/native';

const MainScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TabNavigator navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});

export default MainScreen;
