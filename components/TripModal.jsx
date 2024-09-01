import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TouchableWithoutFeedback, Keyboard, Platform, ActivityIndicator, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { arrayUnion, doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from "../firebase.jsx";
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper } from '@/components/ui/actionsheet';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Textarea, TextareaInput } from "@/components/ui/textarea"
import { CalendarDaysIcon } from "@/components/ui/icon"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button, ButtonText } from "@/components/ui/button"
import DatePickerModal from './DatePickerModal.jsx';
import { FormControl, FormControlError, FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';

/**
 * Trip modal component that allows the user to add or edit a trip.
 * @param {boolean} isOpen - Indicates if the modal is open.
 * @param {function} onClose - The function to call when the modal is closed.
 * @param {string} currentTitle - The current title of the trip.
 * @param {string} currentComment - The current comment of the trip.
 * @param {Date} currentStartDate - The current start date of the trip.
 * @param {Date} currentEndDate - The current end date of the trip.
 * @param {string} currentImage - The current image of the trip.
 * @param {string} currentTripId - The current trip id.
 */
export default function TripModal({ isOpen, onClose, currentTitle, currentComment, currentStartDate, currentEndDate, currentImage, currentTripId }) {
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState("");

    /**
     * Dismiss the keyboard.
     */
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    /**
     * Set the initial values when the modal is opened.
     */
    useEffect(() => {
        if (isOpen) {
            setTitle(currentTitle || '');
            setComment(currentComment || '');
            setImage(currentImage || null);
            setStartDate(currentStartDate instanceof Date ? currentStartDate : new Date());
            setEndDate(currentEndDate instanceof Date ? currentEndDate : new Date());
            setStartDateString(currentStartDate ? currentStartDate.toLocaleDateString() : 'Departure date');
            setEndDateString(currentEndDate ? currentEndDate.toLocaleDateString() : 'Return date');
            setOldStartDate(currentStartDate instanceof Date ? currentStartDate : new Date());
            setOldEndDate(currentEndDate instanceof Date ? currentEndDate : new Date());
            setPickedStart(!!currentStartDate);
            setPickedEnd(!!currentEndDate);
            setLoading(false);
            setError(false);
            setErrorText("");
        }
    }, [isOpen, currentTitle, currentComment, currentStartDate, currentEndDate, currentImage]);

    /**
     * Add listeners for the keyboard.
     */
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    /**
     * Handle the keyboard did show event.
     * @param {*} event 
     */
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

    /**
     * Handle the keyboard did hide event.
     */ 
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

    /**
     * Upload the image to the storage.
     * @param {string} imageUri - The uri of the image.
     * @returns {url} - The url of the image.
     */ 
    const uploadImageToStorage = async (imageUri) => {
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const storageRef = ref(storage, `images/${new Date().toISOString()}`);
            await uploadBytes(storageRef, blob);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            setError(true);
            setErrorText("Error uploading image. Please try again.");
        }
    };

    /**
     * Upload an image from the gallery.
     */ 
    const uploadImage = async () => {
        try {
            await ImagePicker.requestMediaLibraryPermissionsAsync();
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: Platform.OS === 'android' ? 1 : 0,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            setError(true);
            setErrorText("Error uploading image. Please try again.");
        }
    };

    /**
     * Take a photo with the phone  camera.
     */  
    const takePhoto = async () => {
        try {
            await ImagePicker.requestCameraPermissionsAsync();
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: Platform.OS === 'android' ? 1 : 0,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            setError(true);
            setErrorText("Error taking photo. Please try again.");
        }
    };

    /**
     * Select an image from the gallery or take a photo.
     */ 
    const selectImage = () => {
        Alert.alert(
            'Select Image',
            'Choose a method to add a photo',
            [
                {
                    text: 'Take Photo',
                    onPress: () => takePhoto(),
                },
                {
                    text: 'Choose from Gallery',
                    onPress: () => uploadImage(),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    /**
     * Toggle the start date picker.
     */
    const toggleStartDatePicker = () => {
        setShowStartPicker(!showStartPicker);
    }

    /**
     * Toggle the end date picker.
     */
    const toggleEndDatePicker = () => {
        setShowEndPicker(!showEndPicker);
    }

    /**
     * Handle the change of the start date.
     * @param {type} - The type of the change.
     * @param {selectedDate} - The selected date.
     */
    const onChangeStart = ({ type }, selectedDate) => {
        if (type == "set") {
            const currentDate = selectedDate;
            setStartDate(currentDate);
            if (Platform.OS === 'android') {
                if (currentDate <= endDate || !pickedEnd) {
                    toggleStartDatePicker();
                    setStartDateString(currentDate.toLocaleDateString());
                    setOldStartDate(currentDate);
                    setPickedStart(true);
                } else {
                    toggleStartDatePicker();
                    Alert.alert("Back to the Future", "Departure date must be before or in the same day as return date.");
                    toggleStartDatePicker();
                }
            }
        }
        else {
            toggleStartDatePicker();
        }
    };

    /**
     * Handle the change of the end date.
     * @param {type} - The type of the change.
     * @param {selectedDate} - The selected date.
     */ 
    const onChangeEnd = ({ type }, selectedDate) => {
        if (type == "set") {
            const currentDate = selectedDate;
            setEndDate(currentDate);
            if (Platform.OS === 'android') {
                if (currentDate >= startDate || !pickedStart) {
                    toggleEndDatePicker();
                    setEndDateString(currentDate.toLocaleDateString());
                    setOldEndDate(currentDate);
                    setPickedEnd(true);
                } else {
                    toggleEndDatePicker();
                    Alert.alert("Back to the Future", "Return date must be after or in the same day as departure date.");
                    toggleEndDatePicker();
                }
            }
        }
        else {
            toggleEndDatePicker();
        }
    };

    /**
     * Confirm the start date on iOS.
     */
    const confirmIOSStartDate = () => {
        if (startDate <= endDate || !pickedEnd) {
            setStartDateString(startDate.toLocaleDateString());
            setPickedStart(true);
            toggleStartDatePicker();
            setOldStartDate(startDate);
        } else {
            Alert.alert("Back to the Future", "Departure date must be before or in the same day as return date.");
        }
    }

    /**
     * Confirm the end date on iOS.
     */
    const confirmIOSEndDate = () => {
        if (endDate >= startDate || !pickedStart) {
            setEndDateString(endDate.toLocaleDateString());
            setPickedEnd(true);
            toggleEndDatePicker();
            setOldEndDate(endDate);
        } else {
            Alert.alert("Back to the Future", "Return date must be after or in the same day as departure date.");
        }
    }

    /**
     * Add a trip to the database.
     */
    const addTrip = async () => {
        if (title && comment && startDate && endDate && image && startDateString !== 'Departure date' && endDateString !== 'Return date') {
            try {
                setLoading(true);
                const imageUrl = await uploadImageToStorage(image);
                const id = Math.random().toString(36).substr(2, 6);
                const newTrip = {
                    image: imageUrl || '',
                    startDate: startDate,
                    endDate: endDate,
                    title: title,
                    comment: comment,
                    shared: false
                };
                if (!currentTitle) {
                    const tripWithAllFields = {
                        ...newTrip,
                        uid: auth.currentUser.uid,
                        canRead: arrayUnion(),
                        canWrite: arrayUnion(),
                        invitWrite: arrayUnion(),
                        invitRead: arrayUnion(),
                    };
                    await setDoc(doc(db, "Trips", currentTripId ? currentTripId : id), tripWithAllFields);
                } else {
                    // get current image and delete it
                    const currentTripRef = doc(db, "Trips", currentTripId ? currentTripId : id);
                    const currentTrip = await getDoc(currentTripRef);
                    const currentTripData = currentTrip.data();
                    const currentImageRef = ref(storage, currentTripData.image);
                    await deleteObject(currentImageRef);
                    await setDoc(doc(db, "Trips", currentTripId ? currentTripId : id), newTrip, { merge: true });
                }

                setTitle('');
                setComment('');
                setImage(null);
                onClose();
            } catch (error) {
                setError(true);
                setErrorText("Error adding trip. Please try again.");
            } finally {
                setLoading(false); // Stop loading
            }
        } else {
            setError(true);
            setErrorText("Please fill in all fields.");
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
                            {currentTripId ? (
                                <Text style={styles.text}>EDIT TRIP</Text>
                            ) : (
                                <Text style={styles.text}>ADD A TRIP</Text>
                            )}
                        </View>

                        <FormControl isInvalid={error}>
                            <Input variant="rounded" size="lg" style={styles.input}>
                                <InputField
                                    type="title"
                                    placeholder="Title"
                                    onChangeText={setTitle}
                                    defaultValue={title}
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
                                    display='calendar'
                                    mode='date'
                                    value={oldStartDate}
                                    onChange={onChangeStart}
                                />
                            )}
                            {showEndPicker && Platform.OS == 'android' && (
                                <DateTimePicker
                                    display='calendar'
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

                            <TouchableOpacity onPress={selectImage} style={styles.avatarContainer}>
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
                                        defaultValue={comment}
                                    />
                                </Textarea>
                            </View>
                            <View style={styles.errorContainer}>
                                {error && (
                                    <FormControlError>
                                        <FormControlErrorText>
                                            {errorText}
                                        </FormControlErrorText>
                                    </FormControlError>
                                )}
                            </View>
                        </FormControl>

                        <Animated.View style={[styles.buttonContainer, { marginBottom: animatedMargin }]}>
                            <Button
                                style={{ marginBottom: 20 }}
                                onPress={addTrip}
                                size="md"
                                variant="outline"
                                action="primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <ActivityIndicator size="small" color="#fff" />
                                        <ButtonText style={{ marginLeft: 10 }}>Please wait...</ButtonText>
                                    </>
                                ) : (
                                    currentTripId ? (
                                        <ButtonText>Edit</ButtonText>
                                    ) : (
                                        <ButtonText>Add</ButtonText>
                                    ))}
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
        color: 'white',
        width: '100%',
        height: '100%',
    },
    textareacontainer: {
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
        marginVertical: 10
    },
    avatarPlaceholder: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    errorContainer: {
        minHeight: 25,
        justifyContent: 'center',
    },
});
