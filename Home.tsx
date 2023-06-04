import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ToastAndroid, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setServerAddress, setServerPort } from './connectionSlice';

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch();

  // Select server address and port from the connection state
  const serverAddress = useSelector((state: any) => state.connection.serverAddress);
  const serverPort = useSelector((state: any) => state.connection.serverPort);

  // Function to test the connection to the server
  const testConnection = async () => {
    try {
      const response = await fetch(`http://${serverAddress}:${serverPort}`);
      if (response.ok) {
        ToastAndroid.show('Connection Successful!', ToastAndroid.SHORT);
        navigation.navigate('App');
      } else {
        ToastAndroid.show('Connection Error.', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Connection Error.', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Connect to the server using the terminal and write down the information returned here:</Text>
      <Text style={styles.label}>Server Address</Text>
      <TextInput
        placeholder="IP Address"
        value={serverAddress}
        onChangeText={(text) => dispatch(setServerAddress(text))}
        style={styles.input}
      />
      <Text style={styles.label}>Server Port</Text>
      <TextInput
        placeholder="Port"
        value={serverPort}
        onChangeText={(text) => dispatch(setServerPort(text))}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={testConnection}>
        <Text style={styles.buttonText}>Test Connection</Text>
      </TouchableOpacity>
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
  instructions: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    alignSelf: 'flex-start',
  },
  input: {
    marginBottom: 10,
    marginTop: 5,
    width: '100%',
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
