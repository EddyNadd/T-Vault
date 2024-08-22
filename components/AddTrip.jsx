import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
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
} from '@/components/ui/actionsheet';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Textarea, TextareaInput } from "@/components/ui/textarea"
import {CalendarDaysIcon } from "@/components/ui/icon"
import {
    Avatar,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    Button,
    ButtonText,
} from "@/components/ui/button"

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
                console.log("New Trip !");

                setTitle('');
                setComment('');
                setImage(null);
                onClose();
            } catch (error) {
                console.error("Error while adding the document: ", error);
            }
        } else {
            console.error("Title and commentary are requiered.");
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

                    <View style={styles.buttonContainer}>
                        <Text style={styles.text}>ADD A TRIP</Text>
                    </View>

                    <Input variant="rounded" size="lg" style={styles.input}>
                        <InputField
                            type="title"
                            placeholder="Title"
                            onChangeText={setTitle}
                            value={title}
                            autoCapitalize="none"
                            style={styles.inputField}
                        />
                    </Input>

                    <View style={styles.date}>
                        <Input variant="rounded" size="lg" style={styles.fullWidthInput}>
                            <InputSlot>
                                <InputIcon
                                    as={CalendarDaysIcon}
                                    className="text-typography-500 m-2 w-4 h-4"
                                    onPress={() => showDatepicker(true)}
                                />
                            </InputSlot>
                            <InputField
                                placeholder="Departure date"
                                value={startDate.toLocaleDateString()}
                                editable={false}
                                style={styles.inputField}
                            />
                        </Input>

                        <Input variant="rounded" size="lg" style={styles.fullWidthInput}>
                            <InputSlot>
                                <InputIcon
                                    as={CalendarDaysIcon}
                                    className="text-typography-500 m-2 w-4 h-4"
                                    onPress={() => showDatepicker(false)}
                                />
                            </InputSlot>
                            <InputField
                                placeholder="Return date"
                                value={endDate.toLocaleDateString()}
                                editable={false}
                                style={styles.inputField}
                            />
                        </Input>
                    </View>

                    {showPicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={isStart ? startDate : endDate}
                            mode={mode}
                            onChange={onChange}
                        />
                    )}

                    <TouchableOpacity onPress={uploadImage} style={styles.avatarContainer}>
                        <Avatar size="xl">
                            {image ? (
                                <AvatarImage source={{ uri: image }} />
                            ) : (
                                <Text style={styles.avatarPlaceholder}>Add Image</Text>
                            )}
                        </Avatar>
                    </TouchableOpacity>

                    <View style={styles.textareacontainer}>
                        <Textarea
                            size="xl"
                            isReadOnly={false}
                            isInvalid={false}
                            isDisabled={false}
                            className="w-64"
                            style={styles.textarea}
                        >
                            <TextareaInput
                                onChangeText={setComment}
                                placeholder='Comments'
                                style={styles.textareaInput}
                            />
                        </Textarea>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button onPress={addTrip} size="md" variant="outline" action="primary">
                            <ButtonText>Add</ButtonText>
                        </Button>
                    </View>

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
        marginBottom: 10,
    },

    fullWidthInput: {
        flex: 1,
        margin: 10,
    },

    inputField: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: 16,
    },

    text: {
        color: 'white',
        fontSize: 40,
        font: 'Anton',
        fontWeight: 'bold',
    },

    textarea: {
        width: '100%',
        marginVertical: 10,
    },

    textareaInput: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: 16,
        textAlignVertical: 'top', 
    },

    textareacontainer: {
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },

    date: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },

    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },

    avatarPlaceholder: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },

});
