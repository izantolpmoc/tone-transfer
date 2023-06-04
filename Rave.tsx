import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
    ActivityIndicator, 
    Button, 
    ScrollView, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View 
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

export default function RaveView() {
    // Retrieve server address from store
    const serverAddress = useSelector((state: any) => state.connection.serverAddress);
    const serverPort = useSelector((state: any) => state.connection.serverPort);

    // Initialize states
    const [isCalculating, setIsCalculating] = useState(false);
    const [index, setIndex] = useState(0);
    const [defaultAudio, setDefaultAudio] = useState<string | null>(null);
    const [defaultFileName, setDefaultFileName] = useState("Charger un son par défaut");
    const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
    const [transformedAudio, setTransformedAudio] = useState<string | null>(null);
    const [fileAudio, setFileAudio] = useState(""); // not implemented
    const [isUploaded, setIsUploaded] = useState(false);

    const [routes] = useState([
        { key: 'default', title: 'Default Sound' },
        { key: 'recordings', title: 'Recordings' },
        { key: 'files', title: 'Files' },
    ]);

    // Default Sound Tab
    const DefaultSoundTab = ({ playDefaultAudio, defaultFileName }: any) => (
        <TouchableOpacity style={styles.touchableContainer} onPress={playDefaultAudio}>
            <Text style={styles.touchableText}>{defaultFileName}</Text>
        </TouchableOpacity>
    );

    // Recordings Tab
    const RecordingsTab = () => {
        const [selectedRecording, setSelectedRecording] = useState(null);
        const recordings = useSelector((state: any) => state.recordings);

        if(!recordings) return null;

        return (
            <ScrollView>
                {recordings.map((recording: any, index: any) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.touchableContainer,
                            { backgroundColor: recording === selectedRecording ? 'gray' : 'white' }
                        ]}
                        onPress={() => {
                            setSelectedRecording(recording);
                            setRecordedAudio(FileSystem.documentDirectory + recording);
                            setIsUploaded(false);  // Reset the isUploaded state here
                        }}
                    >
                        <Text style={styles.touchableText}>{recording}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    // Files Tab
    const FilesTab = () => <Text>Select an audio file from your phone ! (soon)</Text>;

    // Load default audio file on mount
    useEffect(() => {
        const loadDefaultAudio = async () => {
            const asset = Asset.fromModule(require('./assets/test_sample.wav'));
            await asset.downloadAsync();
            setDefaultAudio(asset.localUri);
            setDefaultFileName(asset.name);
        };
        loadDefaultAudio();
    }, []);

    // Upload audio file to server
    const uploadToServer = async () => {
        let audioUri;
        // Select audio uri to target depending on the tab
        switch (index) {
            case 0:
                audioUri = defaultAudio ?? "";
                break;
            case 1:
                audioUri = recordedAudio ?? "";
                break;
            case 2:
                audioUri = fileAudio;
                break;
            default:
                return;
        }

        setIsCalculating(true);

        const uploadResponse = await FileSystem.uploadAsync(`http://${serverAddress}:${serverPort}/upload`, audioUri, {
            fieldName: 'file',
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            headers: { filename: audioUri }
        });

        // Check if upload was successful
        if(uploadResponse.status === 200){
            downloadFile();
        } else {
            console.error("Upload failed with status code: " + uploadResponse.status);
        }
    };

    // Download transformed audio file
    const downloadFile = async () => {
        let directory = FileSystem.documentDirectory + "my_directory";

        const dirInfo = await FileSystem.getInfoAsync(directory);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(directory);
        }

        const { uri } = await FileSystem.downloadAsync(
            `http://${serverAddress}:${serverPort}/download`,
            directory + "/hey.wav"
        );

        setTransformedAudio(uri);
        setIsUploaded(true);
        setIsCalculating(false);
    };

    // Play default audio file
    const playDefaultAudio = async () => {
        if (defaultAudio) {
            await playAudio(defaultAudio);
        }
    };

    // Play any audio file
    const playAudio = async (audioUri: any) => {
        const soundObject = new Audio.Sound();
        try {
            await soundObject.loadAsync({ uri: audioUri });
            await soundObject.playAsync();
        } catch (error) {
            console.error(error);
        }
    };

    // Play transformed audio file
    const playTransformedAudio = async () => {
        if (transformedAudio) {
            const soundObject = new Audio.Sound();
            try {
                await soundObject.loadAsync({ uri: transformedAudio });
                await soundObject.playAsync();
            } catch (error) {
                console.log(error);
            }
        }
    };

    // Render scene map
    const renderScene = SceneMap({
        default: () => <DefaultSoundTab playDefaultAudio={playDefaultAudio} defaultFileName={defaultFileName} />,
        recordings: RecordingsTab,
        files: FilesTab,
    });

    // Render component
    return (
        <View style={styles.container}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={(i) => {
                  setIndex(i);
                  setIsUploaded(false); // Reset the isUploaded state
              }}
                renderTabBar={props => <TabBar {...props} />}
                initialLayout={{ width: 360 }}
            />
            {!isUploaded && <Button title="Upload" onPress={uploadToServer} />}
            {isCalculating && <ActivityIndicator size="large" color="#0000ff" />}
            {isUploaded && 
                <Button title="Play Original" onPress={() => {
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
                }} 
                />}
            {isUploaded && <Button title="Play Transformed" onPress={playTransformedAudio} />}
        </View>
    );
}

// Define styles
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
