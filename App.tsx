import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';

import HomeScreen from './Home';
import RecordView from './Record';
import RaveView from './Rave';
import { store } from './Store';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  // Render the main app component
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="App" component={AppTabs} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

function AppTabs() {
  // Render the tab navigation component
  return (
    <Provider store={store}>
      <Tab.Navigator
        screenOptions={{
          swipeEnabled: true,
          tabBarStyle: {
            paddingTop: 20
          },
        }}
      >
        <Tab.Screen name="RecordView" component={RecordView} />
        <Tab.Screen name="RaveView" component={RaveView} />
      </Tab.Navigator>
    </Provider>
  );
}
