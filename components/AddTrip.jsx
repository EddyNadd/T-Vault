import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated ,SafeAreaView, Pressable, TouchableHighlight, TouchableWithoutFeedback,  Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from "../firebase.jsx";
import { Actionsheet,  ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper }from '@/components/ui/actionsheet';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Textarea, TextareaInput } from "@/components/ui/textarea"
import {CalendarDaysIcon } from "@/components/ui/icon"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button, ButtonText } from "@/components/ui/button"


export default function AddTrip({ isOpen, onClose }) {
    const [image, setImage] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [isStart, setIsStart] = useState(true);
    const [picked, setPicked] = useState(false);
    const animatedMargin = useRef(new Animated.Value(0)).current;

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleKeyboardDidShow = (event) => {
        const height = event.endCoordinates.height;

        Animated.timing(animatedMargin, {
            toValue: height,
            duration: 0,
            useNativeDriver: false,
        }).start();
    };

    const handleKeyboardDidHide = () => {
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

    const onChange = (event, selectedDate) => {
        setShowPicker(false);
        if (isStart) {
            setStartDate(selectedDate || startDate);
        } else {
            setEndDate(selectedDate || endDate);
        }
        setPicked(true);
    };

    const showDatepicker = (start = true) => {
        setIsStart(start);
        setShowPicker(true);
    };

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
                    shared: false,
                    canRead: [],
                    canWrite: []
                };
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
                        <TouchableOpacity onPress={() => showDatepicker(true)} style={styles.fullWidthInput}>
                            <Input variant="rounded" size="lg" style={styles.fullWidthInput}>
                                <InputSlot>
                                    <InputIcon
                                        as={CalendarDaysIcon}
                                        className="text-typography-500 m-2 w-4 h-4"
                                    />
                                </InputSlot>
                                <InputField
                                    value={picked ? startDate.toLocaleDateString() : 'Departure date'}
                                    editable={false}
                                    style={styles.inputField}
                                />
                            </Input>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => showDatepicker(false)} style={styles.fullWidthInput}>
                            <Input variant="rounded" size="lg" style={styles.fullWidthInput}>
                                <InputSlot>
                                    <InputIcon
                                        as={CalendarDaysIcon}
                                        className="text-typography-500 m-2 w-4 h-4"
                                    />
                                </InputSlot>
                                <InputField
                                    value={picked ? endDate.toLocaleDateString() : 'Return date'}
                                    editable={false}
                                    style={styles.inputField}
                                />
                            </Input>
                        </TouchableOpacity>
                    </View>

                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={showPicker}
                        onRequestClose={() => setShowPicker(false)}
                    >
                        <SafeAreaView style={{ flex: 1 }}>
                            <Pressable
                                style={{ flex: 1, alignItems: 'flex-end', flexDirection: 'row' }}
                                activeOpacity={1}
                                onPress={() => setShowPicker(false)}
                            >
                                <TouchableHighlight
                                    underlayColor="transparent"
                                    style={{ flex: 1 }}
                                >
                                    <View style={{ backgroundColor: "#FFFFFF", overflow: 'hidden', borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
                                        <View style={{ marginTop: 20, marginBottom: 20, backgroundColor: 'white' }}>
                                            <DateTimePicker
                                                display='spinner'
                                                mode='date'
                                                value={isStart ? startDate : endDate}
                                                onChange={onChange}
                                            />
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            </Pressable>
                        </SafeAreaView>
                        <SafeAreaView style={{ flex: 0, backgroundColor: '#FFFFFF' }} />
                    </Modal>

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

                    <Animated.View style={[styles.buttonContainer, {marginBottom: animatedMargin}]}>
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
    },

});
