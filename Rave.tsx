import React, { useState, useEffect } from 'react';
import { Text, View, Button, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useSelector } from 'react-redux';

const DefaultSoundTab = ({ playDefaultAudio, defaultFileName }: any) => (
  <TouchableOpacity style={styles.touchableContainer} onPress={playDefaultAudio}>
    <Text style={styles.touchableText}>{defaultFileName}</Text>
  </TouchableOpacity>
);
const RecordingsTab = () => <Text>Sélectionner un clip parmi les enregistrements</Text>;
const FilesTab = () => <Text>Sélectionner un son dans les fichiers du téléphone</Text>;

export default function RaveView() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [index, setIndex] = useState(0);
  const [defaultAudio, setDefaultAudio] = useState<string | null>(null);
  const [defaultFileName, setDefaultFileName] = useState("Charger un son par défaut");
  const [recordedAudio, setRecordedAudio] = useState("");
  const [fileAudio, setFileAudio] = useState("");
  const [isUploaded, setIsUploaded] = useState(false);
  const serverAddress = useSelector((state: any) => state.connection.serverAddress);
  const serverPort = useSelector((state: any) => state.connection.serverPort);
  const [routes] = useState([
    { key: 'default', title: 'Default Sound' },
    { key: 'recordings', title: 'Recordings' },
    { key: 'files', title: 'Files' },
  ]);

  useEffect(() => {
    const loadDefaultAudio = async () => {
      const asset = Asset.fromModule(require('./assets/test_sample.wav'));
      await asset.downloadAsync();
      setDefaultAudio(asset.localUri);
      setDefaultFileName(asset.name);
    };
    loadDefaultAudio();
  }, []);

  const uploadToServer = async () => {
    let audioUri;

    // Choisir l'URI de l'audio en fonction de l'onglet sélectionné
    switch (index) {
      case 0:
        audioUri = defaultAudio ?? "";
        break;
      case 1:
        audioUri = recordedAudio;
        break;
      case 2:
        audioUri = fileAudio;
        break;
      default:
        return;
    }

    setIsCalculating(true);

    // Upload le fichier vers le serveur
    const options: FileSystem.FileSystemUploadOptions = {
      httpMethod: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'audio/mp3'
      },
      uploadType: FileSystem.FileSystemUploadType.MULTIPART
    };

    const uploadResponse = await FileSystem.uploadAsync(`http://${serverAddress}:${serverPort}/upload`, audioUri, options);

    // Check if upload was successful
    if(uploadResponse.status == 200){
      // Download the transformed file from the server
      const downloadUri = FileSystem.documentDirectory + 'transformed_audio.wav';
      const result = await FileSystem.downloadAsync(`http://${serverAddress}:${serverPort}/download`, downloadUri);
      setIsUploaded(true);
      console.log(result);
    }else{
      console.error("Upload failed with status code: " + uploadResponse.status);
    }

    setIsCalculating(false);
};

const playDefaultAudio = async () => {
  if (defaultAudio) {
    await playAudio(defaultAudio);
  }
};

  const playAudio = async (audioUri: any) => {
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync({ uri: audioUri });
      await soundObject.playAsync();
    } catch (error) {
      console.error(error);
    }
  };

  const renderScene = SceneMap({
    default: () => <DefaultSoundTab playDefaultAudio={playDefaultAudio} defaultFileName={defaultFileName} />,
    recordings: RecordingsTab,
    files: FilesTab,
  });

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={props => <TabBar {...props} />}
        initialLayout={{ width: 360 }}
      />
      {!isUploaded && <Button title="Upload" onPress={uploadToServer} />}
      {isCalculating && <ActivityIndicator size="large" color="#0000ff" />}
      {isUploaded && <Button title="Play Original" onPress={() => {
        let audioUri;
        switch (index) {
          case 0:
            audioUri = defaultAudio;
            break;
          case 1:
            audioUri = recordedAudio;
            break;
          case 2:
            audioUri = fileAudio;
            break;
          default:
            return;
        }
        playAudio(audioUri)
      }} />}
      {isUploaded && <Button title="Play Transformed" onPress={() => playAudio(FileSystem.documentDirectory + 'transformed_audio.wav')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  touchableContainer: {
    padding: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginVertical: 10,
  },
  touchableText: {
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: '#eee',
  },
  tabBarIndicator: {
    backgroundColor: '#000',
  },
  tabBarLabel: {
    fontWeight: 'bold',
    color: '#000',
  },
  button: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#000',
  },
});
