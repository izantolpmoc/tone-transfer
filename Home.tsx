import React from 'react';
import { View, Text, TextInput, Button, ToastAndroid, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setServerAddress, setServerPort } from './connexionSlice';

export default function HomeScreen({navigation} : any) {
  const dispatch = useDispatch();
  const serverAddress = useSelector((state: any) => state.connection.serverAddress);
  const serverPort = useSelector((state: any) => state.connection.serverPort);

  const testConnection = async () => {
    try {
      const response = await fetch(`http://${serverAddress}:${serverPort}`);
      if (response.ok) {
        ToastAndroid.show('Connexion réussie !', ToastAndroid.SHORT);
        navigation.navigate('App');
      } else {
        ToastAndroid.show('Erreur de connexion.', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Erreur de connexion.', ToastAndroid.SHORT);
    }
  };

  return (
      <View style={styles.container}>
      <Text>Connect to the server using the terminal and write down the information returned here: </Text>
        <TextInput
          placeholder="Adresse IP"
          value={serverAddress}
          onChangeText={text => dispatch(setServerAddress(text))}
          style={styles.input}
        />
        <TextInput
          placeholder="Port"
          value={serverPort}
          onChangeText={text => dispatch(setServerPort(text))}
          style={styles.input}
        />
        <Button title="Test connexion" onPress={testConnection} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  input: {
    marginBottom: 10,
    width: '100%',
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
});
