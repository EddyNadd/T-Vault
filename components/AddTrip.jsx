import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from "../firebase.jsx";
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper } from '@/components/ui/actionsheet';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Textarea, TextareaInput } from "@/components/ui/textarea"
import { CalendarDaysIcon } from "@/components/ui/icon"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button, ButtonText } from "@/components/ui/button"
import DatePickerModal from './DatePickerModal.jsx';

export default function AddTrip({ isOpen, onClose }) {
    const [image, setImage] = useState(null);
    const [startDateString, setStartDateString] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [endDateString, setEndDateString] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [oldStartDate, setOldStartDate] = useState(new Date());
    const [oldEndDate, setOldEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [pickedStart, setPickedStart] = useState(false);
    const [pickedEnd, setPickedEnd] = useState(false);
    const animatedMargin = useRef(new Animated.Value(0)).current;

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setComment('');
            setImage(null);
            setStartDate(new Date());
            setEndDate(new Date());
            setStartDateString('Departure date');
            setEndDateString('Return date');
            setPickedStart(false);
            setPickedEnd(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleKeyboardDidShow = (event) => {
        if (Platform.OS === 'android') {
            return;
        }
        const height = event.endCoordinates.height;

        Animated.timing(animatedMargin, {
            toValue: height,
            duration: 0,
            useNativeDriver: false,
        }).start();
    };

    const handleKeyboardDidHide = () => {
        if (Platform.OS === 'android') {
            return;
        }
        Animated.timing(animatedMargin, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
        }).start();
    };

    const uploadImageToStorage = async (imageUri) => {
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const storageRef = ref(storage, `images/${new Date().toISOString()}`);
            await uploadBytes(storageRef, blob);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            console.log('Error uploading image: ', error);
            throw error;
        }
    };

    const uploadImage = async () => {
        try {
            await ImagePicker.requestMediaLibraryPermissionsAsync();
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0,
            });

            if (!result.cancelled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const toggleStartDatePicker = () => {
        setShowStartPicker(!showStartPicker);
    }

    const toggleEndDatePicker = () => {
        setShowEndPicker(!showEndPicker);
    }

    const onChangeStart = ({ type }, selectedDate) => {
        if (type == "set") {
            const currentDate = selectedDate;
            setStartDate(currentDate);
            if (Platform.OS === 'android') {
                toggleStartDatePicker();
                setStartDateString(currentDate.toLocaleDateString());
                setOldStartDate(currentDate);
                setPickedStart(true);
            }
        }
        else {
            toggleStartDatePicker();
        }
    };

    const onChangeEnd = ({ type }, selectedDate) => {
        if (type == "set") {
            const currentDate = selectedDate;
            setEndDate(currentDate);
            if (Platform.OS === 'android') {
                toggleEndDatePicker();
                setStartDateString(currentDate.toLocaleDateString());
                setOldEndDate(currentDate);
                setPickedEnd(true);
            }
        }
        else {
            toggleEndDatePicker();
        }
    };

    const confirmIOSStartDate = () => {
        setStartDateString(startDate.toLocaleDateString());
        setPickedStart(true);
        toggleStartDatePicker();
        setOldStartDate(startDate);
    }

    const confirmIOSEndDate = () => {
        setEndDateString(endDate.toLocaleDateString());
        setPickedEnd(true);
        toggleEndDatePicker();
        setOldEndDate(endDate);
    }

    const addTrip = async () => {
        if (title && comment && startDate && endDate && image) {
            try {
                const imageUrl = await uploadImageToStorage(image);
                const newTrip = {
                    image: imageUrl || '',
                    startDate: startDate,
                    endDate: endDate,
                    title: title,
                    comment: comment,
                    uid: auth.currentUser.uid,
                    username: auth.currentUser.displayName,
                    canRead: [],
                    canWrite: [],
                    shared: false
                };
                const id = Math.random().toString(36).substr(2, 6);
                await setDoc(doc(db, "trips", id), newTrip);

                setTitle('');
                setComment('');
                setImage(null);
                onClose();
            } catch (error) {
                console.error("Error while adding the document: ", error);
            }
        } else {
            console.error("Title and commentary are required.");
        }
    };

    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <ActionsheetBackdrop />
            <ActionsheetContent>
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>

                    <View contentContainerStyle={{ paddingBottom: 20 }}>

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
                            <TouchableOpacity onPress={() => toggleStartDatePicker()} style={styles.fullWidthInput}>
                                <Input variant="rounded" size="lg" pointerEvents="none">
                                    <InputSlot>
                                        <InputIcon
                                            as={CalendarDaysIcon}
                                            className="text-typography-500 m-2 w-4 h-4"
                                        />
                                    </InputSlot>
                                    <InputField
                                        value={pickedStart ? startDateString : 'Departure date'}
                                        editable={false}
                                        style={styles.inputField}
                                    />
                                </Input>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => toggleEndDatePicker()} style={styles.fullWidthInput}>
                                <Input variant="rounded" size="lg" pointerEvents="none">
                                    <InputSlot>
                                        <InputIcon
                                            as={CalendarDaysIcon}
                                            className="text-typography-500 m-2 w-4 h-4"
                                        />
                                    </InputSlot>
                                    <InputField
                                        value={pickedEnd ? endDateString : 'Return date'}
                                        editable={false}
                                        style={styles.inputField}
                                    />
                                </Input>
                            </TouchableOpacity>
                        </View>
                        {showStartPicker && Platform.OS === 'android' && (
                            <DateTimePicker
                                display='spinner'
                                mode='date'
                                value={oldStartDate}
                                onChange={onChangeStart}
                            />
                        )}
                        {showEndPicker && Platform.OS == 'android' && (
                            <DateTimePicker
                                display='spinner'
                                mode='date'
                                value={oldEndDate}
                                onChange={onChangeEnd}
                            />
                        )}
                        {Platform.OS === 'ios' && (
                            <View>
                            <DatePickerModal
                                isOpen={showStartPicker}
                                onClose={toggleStartDatePicker}
                                onConfirm={confirmIOSStartDate}
                                onCancel={toggleStartDatePicker}
                                selectedDate={oldStartDate}
                                onDateChange={onChangeStart}
                            />
                            <DatePickerModal
                                isOpen={showEndPicker}
                                onClose={toggleEndDatePicker}
                                onConfirm={confirmIOSEndDate}
                                onCancel={toggleEndDatePicker}
                                selectedDate={oldEndDate}
                                onDateChange={onChangeEnd}
                            />
                            </View>
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
                                    placeholder="Comments"
                                    style={styles.textareaInput}
                                />
                            </Textarea>
                        </View>

                        <Animated.View style={[styles.buttonContainer, { marginBottom: animatedMargin }]}>
                            <Button onPress={addTrip} size="md" variant="outline" action="primary">
                                <ButtonText>Add</ButtonText>
                            </Button>
                        </Animated.View>

                    </View>
                </TouchableWithoutFeedback>
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
        margin: 10
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
        margin: 10
    },

    date: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },

    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10
    },

    avatarPlaceholder: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    }
});
