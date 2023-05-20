import React, { useState } from 'react';
import { View, Text, TextInput, Button, ToastAndroid, StyleSheet } from 'react-native';

export default function HomeScreen({navigation} : any) {
  const [serverAddress, setServerAddress] = useState('');
  const [serverPort, setServerPort] = useState('');

  const testConnection = async () => {
    try {
      const response = await fetch(`http://${serverAddress}:${serverPort}`);
      if (response.ok) {
        ToastAndroid.show('Connexion réussie !', ToastAndroid.SHORT);
        navigation.navigate('RecordView');
        
      } else {
        ToastAndroid.show('Erreur de connexion.', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Erreur de connexion.', ToastAndroid.SHORT);
    }
  };

  return (
      <View style={styles.container}>
      <Text>Connect to the server using the terminal and write down the informationr returned here: </Text>
        <TextInput
          placeholder="Adresse IP"
          value={serverAddress}
          onChangeText={setServerAddress}
          style={styles.input}
        />
        <TextInput
          placeholder="Port"
          value={serverPort}
          onChangeText={setServerPort}
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
