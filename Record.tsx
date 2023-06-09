import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, FlatList, TouchableOpacity, TextInput, StyleSheet, Modal } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useDispatch } from 'react-redux';
import { addRecording, removeRecording, renameRecording, loadCurrentRecordings } from './recordingsSlice';
import { useIsFocused } from '@react-navigation/native';

export default function RecordView() {
    const dispatch = useDispatch(); // Dispatch Redux actions

    const isFocused = useIsFocused(); // True when screen is displayed

    const AudioRecorder = useRef(new Audio.Recording()); // Handle audio recording
    const AudioPlayer = useRef(new Audio.Sound()); // Handle audio playing

    const [RecordedURI, SetRecordedURI] = useState<string>("");
    const [AudioPermission, SetAudioPermission] = useState<boolean>(false);
    const [IsRecording, SetIsRecording] = useState<boolean>(false);
    const [IsPlaying, SetIsPlaying] = useState<boolean>(false);
    const [Recordings, setRecordings] = useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [ModifiedRecordingName, setModifiedRecordingName] = useState<string>("");

    useEffect(() => {
        getAudioPermission();
        loadRecordings();
    }, []);

    useEffect( () => {
        if(isFocused) // Load recordings when screen is in focus
            loadRecordings();
    }, [isFocused]);

    const getAudioPermission = async () => {
        const { granted } = await Audio.requestPermissionsAsync();
        SetAudioPermission(granted);
    };

    const startRecording = async () => {
        if (AudioPermission) { 
            try {
                await AudioRecorder.current.prepareToRecordAsync(Audio.RecordingOptionsPresets.HighQuality);
                await AudioRecorder.current.startAsync();
                SetIsRecording(true);
            } catch (error) {
                console.log(error);
            }
        } else {
            getAudioPermission(); // Request permission if not granted
        }
    };

    const stopRecording = async () => {
        try {
            await AudioRecorder.current.stopAndUnloadAsync();

            const result = AudioRecorder.current.getURI();
            if (result) {
                const fileName = `recording-${Date.now()}.wav`;
                const destPath = FileSystem.documentDirectory + fileName;

                await FileSystem.moveAsync({
                from: result,
                to: destPath,
                });

                SetRecordedURI(destPath);
                setRecordings([...Recordings, destPath]);
                dispatch(addRecording(fileName)); // Add new recording
            }

            AudioRecorder.current = new Audio.Recording();
            SetIsRecording(false);

            setIsModalVisible(true); // Open modal
        } catch (error) {
            console.log(error);
        }
    };

    const onPlaybackStatusUpdate = (playbackStatus: any) => {
        if (playbackStatus.didJustFinish) {
            SetIsPlaying(false); // Reset play/stop buttons
        }
    };

    const playRecordedAudio = async (uri: string) => {
        try {
            const fileUri = FileSystem.documentDirectory + uri;
            await AudioPlayer.current.unloadAsync();
            await AudioPlayer.current.loadAsync({ uri: fileUri });
            AudioPlayer.current.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
            await AudioPlayer.current.playAsync();
            SetIsPlaying(true);
        } catch (error) {
            console.log(error);
        }
    };

    const stopPlaying = async () => {
        try {
            await AudioPlayer.current.stopAsync();
            SetIsPlaying(false);
        } catch (error) {
            console.log(error);
        }
    };

    const loadRecordings = async () => {
        try {
            const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
            const audioFiles = files.filter((file) => file.endsWith('.wav'));
            setRecordings(audioFiles);
            dispatch(loadCurrentRecordings(audioFiles)); // Load recordings
        } catch (error) {
            console.log(error);
        }
    };

    const deleteRecording = async (uri: string) => {
        try {
            const fileUri = FileSystem.documentDirectory + uri;
            await FileSystem.deleteAsync(fileUri);
            setRecordings(Recordings.filter((recording) => recording !== uri));
            dispatch(removeRecording(uri)); // Remove recording
        } catch (error) {
            console.log(error);
        }
    };

    const modifyRecordingName = async (oldUri: string, newUri: string) => {
        try {
            await FileSystem.moveAsync({
                from: oldUri,
                to: newUri,
            });
            const newRecordingsList = Recordings.map((uri) => uri === oldUri ? newUri.split("/").pop()! : uri.split("/").pop()!);
            setRecordings(newRecordingsList); // Update list of recordings
            SetRecordedURI(newUri);
            dispatch(renameRecording({oldUri, newUri})); // Rename recording
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <Button
                title={IsRecording ? "Stop Recording" : "Start Recording"}
                color={IsRecording ? "red" : "green"}
                onPress={IsRecording ? stopRecording : startRecording}
            />
            {IsPlaying && (
                <Button
                    title="Stop Sound"
                    color="red"
                    onPress={stopPlaying}
                />
            )}
            <View style={styles.separator} />

            <FlatList
                data={Recordings}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                <View style={styles.recordingItem}>
                    <TouchableOpacity onPress={() => playRecordedAudio(item)}>
                    <Text>{item}</Text>
                    </TouchableOpacity>
                    <Button title="Delete" onPress={() => deleteRecording(item)} />
                </View>
                )}
            />

            <Modal visible={isModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                <Text>Écouter l'audio enregistré : {RecordedURI.split("/").pop()}</Text>
                <Button title="Play" onPress={() => playRecordedAudio(RecordedURI.split("/").pop()!)} />

                <Text>Modifier le nom de l'enregistrement : </Text>
                <TextInput
                    style={styles.input}
                    onChangeText={text => setModifiedRecordingName(text)}
                    value={ModifiedRecordingName}
                    placeholder="Enter new name..."
                />
                <Button title="Modify" onPress={() => modifyRecordingName(RecordedURI, FileSystem.documentDirectory + ModifiedRecordingName + '.wav')} />

                <Button title="Fermer" onPress={() => {
                    setIsModalVisible(false)
                    const newRecordingsList = Recordings.map((uri) => uri.split("/").pop()!)
                    setRecordings(newRecordingsList)
                }} />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        padding: 16,
    },
    recordingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        padding: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#3498db",
        borderRadius: 5,
        padding: 8,
        marginBottom: 8,
        width: 200,
    },
    separator: {
        height: 1,   
        width: '100%',
        backgroundColor: '#ccc',  
        marginVertical: 10,  
    }
});
