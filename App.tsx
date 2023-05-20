import React from 'react';
import HomeScreen from './Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import RecordView from './Record';


export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name={'Home'}
          component={HomeScreen}
        />
        <Stack.Screen name={'RecordView'} component={RecordView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
