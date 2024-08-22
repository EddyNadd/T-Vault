import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.jsx";
import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetItem,
    ActionsheetItemText,
} from '@/components/ui/actionsheet';

export default function AddTrip({ isOpen, onClose }) {
    const [image, setImage] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [showPicker, setShowPicker] = useState(false);
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
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onChange = (event, selectedDate) => {
        setShowPicker(false);
        if (isStart) {
            setStartDate(selectedDate || startDate);
        } else {
            setEndDate(selectedDate || endDate);
        }
    };

    const showDatepicker = (start = true) => {
        setShowPicker(true);
        setIsStart(start);
        setMode('date');
    };

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
                const id = Math.random().toString(36).substr(2, 6);
                await setDoc(doc(db, "trips", id), newTrip);
                console.log("Nouveau voyage ajouté ou mis à jour !");
                
                setTitle('');
                setComment('');
                setImage(null);
                onClose();
            } catch (error) {
                console.error("Erreur lors de l'ajout du document: ", error);
            }
        } else {
            console.error("Les champs Title et Commentaire sont requis.");
        }
    };

    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <ActionsheetBackdrop />
            <ActionsheetContent>
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>

                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    <Text style={styles.text}>Let's add your trip!</Text>

                    <View style={styles.imageContainer}>
                        {image && <Image source={{ uri: image }} style={styles.image} />}
                    </View>

                    <ActionsheetItem onPress={uploadImage}>
                        <ActionsheetItemText>Choose a picture</ActionsheetItemText>
                    </ActionsheetItem>

                    <ActionsheetItem onPress={() => showDatepicker(true)}>
                        <ActionsheetItemText>Start date: {startDate.toLocaleDateString()}</ActionsheetItemText>
                    </ActionsheetItem>

                    <ActionsheetItem onPress={() => showDatepicker(false)}>
                        <ActionsheetItemText>Return date: {endDate.toLocaleDateString()}</ActionsheetItemText>
                    </ActionsheetItem>

                    {showPicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={isStart ? startDate : endDate}
                            mode={mode}
                            onChange={onChange}
                        />
                    )}

                    <TextInput
                        placeholderTextColor="white"
                        placeholder="Title"
                        style={styles.input}
                        value={title}
                        onChangeText={(text) => setTitle(text)}
                    />

                    <TextInput
                        placeholderTextColor="white"
                        placeholder="Commentaire"
                        style={styles.input}
                        value={comment}
                        onChangeText={(text) => setComment(text)}
                    />

                    <ActionsheetItem onPress={addTrip}>
                        <ActionsheetItemText>Confirm</ActionsheetItemText>
                    </ActionsheetItem>
                </ScrollView>
            </ActionsheetContent>
        </Actionsheet>
    );
}

const styles = StyleSheet.create({
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
    },
});
