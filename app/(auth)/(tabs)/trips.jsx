import { View, Text, Button, TextInput, StyleSheet, Modal, Image, ScrollView, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc} from "firebase/firestore";
import { db } from "../../../firebase.jsx";



export default function Trips() {
    const [image, setImage] = useState();
    const [isModalVisible, setModalVisible] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date())
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [isStart, setIsStart] = useState(true);

    const uploadImage = async () => {
        try {
            await ImagePicker.requestMediaLibraryPermissionsAsync();
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.cancelled) {
                await saveImage(result.assets[0].uri);
            }

        } catch (error) {
            console.log(error);
        }
    }

    const saveImage = async (image) => {
        try {
            setImage(image);
        }
        catch (error) {
            console.log(error);
        }
    }

    const onChange = (event, selectedDate) => {
        setShow(false);
        if (isStart) {
            setStartDate(selectedDate || startDate);
        } else {
            setEndDate(selectedDate || endDate);
        }
    };

    const showMode = (currentMode, start = true) => {
        setShow(true);
        setMode(currentMode);
        setIsStart(start);
    };

    const showDatepicker = (start = true) => {
        showMode('date', start);
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const confirmData = () => {
        addTrip();
        toggleModal();
    }
    const addTrip = async () => {
        if (title && comment) {
            const newTrip = {
                image: image || '',
                startDate: startDate,
                endDate: endDate,
                title: title,
                comment: comment,
            };

            try {
                // Utiliser setDoc pour créer ou mettre à jour un document avec un ID spécifique (par exemple, basé sur la title)
                //generate a unique 6 caracter id for the trip composed of 6 random caracter and digits
                const id = Math.random().toString(36).substr(2, 6);
                await setDoc(doc(db, "trips", id), newTrip);
                console.log("Nouveau voyage ajouté ou mis à jour !");
                
                // Réinitialiser les champs après l'ajout
                setTitle('');
                setComment('');
                setImage(null);
            } catch (error) {
                console.error("Erreur lors de l'ajout du document: ", error);
            }
        } else {
            console.error("Les champs Title et Commentaire sont requis.");
        }
    };


    return (
        <View style={{ flex: 1, alignItems: 'center ', justifyContent: 'center', backgroundColor: '#1E1E1E' }}>
            <View style={styles.buttonContainer}>
                <Button title="add" onPress={toggleModal} />
            </View>
            <Modal visible={isModalVisible} transparent={false} animationType="slide">
                <TouchableWithoutFeedback onPress={toggleModal}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.text}>Let's add your trip!</Text>
                            <View>
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: image }} style={styles.image} />
                                </View>
                                <View style={styles.buttonContainer}>
                                    <Button title="Choose a picture" onPress={uploadImage} />
                                </View>
                            </View>
                            <View>
                                <View style={styles.buttonContainer}>
                                    <Button onPress={() => showDatepicker(true)} title="Start" />
                                </View>
                                <Text style={styles.text}>Start date: {startDate.toLocaleDateString()}</Text>
                                <View style={styles.buttonContainer}>
                                    <Button onPress={() => showDatepicker(false)} title="Return" />
                                </View>
                                <Text style={styles.text}>Return date: {endDate.toLocaleDateString()}</Text>
                                {show && (
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={isStart ? startDate : endDate}
                                        mode={mode}
                                        onChange={onChange}
                                    />
                                )}
                            </View>
                            <View>
                                <TextInput placeholderTextColor="white" placeholder="Title" style={styles.input} value={title} onChangeText={(text) => setTitle(text)}/>
                            </View>
                            <View>
                                <TextInput placeholderTextColor="white" placeholder="Commentaire" style={styles.input} value={comment} onChangeText={(text) => setComment(text)} />
                            </View>

                            <View style={styles.buttonContainer}>
                                <Button title="Confirm" onPress={confirmData} />
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({

    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
    },

    modalContent: {
        width: '100%',
        height: '80%',
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,

    },

    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },

    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
    },

    input: {
        borderWidth: 1,
        borderColor: 'white',
        padding: 10,
        margin: 10,
        color: 'white',
        fontSize: 20,
    },

    text: {
        color: 'white',
        fontSize: 20,
        font: 'Roboto',
        borderColor: 'black',
    },
});
