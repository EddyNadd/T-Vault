import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, ActivityIndicator, KeyboardAvoidingView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePickerModal from '../../../components/DatePickerModal';
import * as ImagePicker from 'expo-image-picker';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { CalendarDaysIcon } from "@/components/ui/icon";
import { CloseCircleIcon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from "expo-router";
import COLORS from '@/styles/COLORS';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from '../../../map.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from "../../../firebase.jsx";
import { doc, getDoc, setDoc, GeoPoint } from "firebase/firestore";
import { Feather, Entypo } from '@expo/vector-icons';
import {Icon} from "@/components/ui/icon";
import AndroidSafeArea from '../../../styles/AndroidSafeArea';

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const UpdateStep = (isOpen, onClose) => {
    const { id } = useLocalSearchParams();
    const [tripId, stepId] = id.split('-');
    const [title, setTitle] = useState('');
    const [destination, setDestination] = useState('');
    const [comment, setComment] = useState('');
    const [image, setImage] = useState(null);
    const [startDateString, setStartDateString] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [endDateString, setEndDateString] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [oldStartDate, setOldStartDate] = useState(new Date());
    const [oldEndDate, setOldEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [pickedStart, setPickedStart] = useState(false);
    const [pickedEnd, setPickedEnd] = useState(false);
    const [components, setComponents] = useState([]);
    const [isInputActive, setIsInputActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tabOrder, setTabOrder] = useState([]);
    const [inputWidth, setInputWidth] = useState(0);
    const [geoPoint, setGeoPoint] = useState(null);
    const router = useRouter();
    const useRefReact = useRef();

    useEffect(() => {
        useRefReact.current?.setAddressText(destination);
    }, [destination]);

    useEffect(() => {
        // get the trip data from the database
        const getTripData = async () => {
            try {
                const docRef = doc(db, "trips", tripId, "steps", stepId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title);
                    setDestination(data.destination);
                    setGeoPoint(data.geopoint);
                    if (data.startDate) {
                        const incomingStartDate = data.startDate?.toDate();
                        setStartDate(incomingStartDate);
                        if (incomingStartDate) {
                            setPickedStart(true);
                            setOldStartDate(incomingStartDate);
                            setStartDateString(incomingStartDate.toLocaleDateString());
                        }
                    }
                    if (data.endDate) {
                        const incomingEndDate = data.endDate?.toDate();
                        setEndDate(incomingEndDate);
                        if (incomingEndDate) {
                            setPickedEnd(true);
                            setOldEndDate(incomingEndDate);
                            setEndDateString(oldEndDate.toLocaleDateString());
                        }
                    }
                    setTabOrder(data.tabOrder);
                    setComponents(data.tabOrder.map((type) => {
                        if (type === 'image') {
                            return { type, uri: data.images.shift(), id: generateUniqueId() };
                        } else if (type === 'comment') {
                            return { type, id: generateUniqueId(), value: data.comments.shift() };
                        }
                    }
                    ));
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error getting document:", error);
            }
        };

        if (isOpen) {
            setTitle('');
            setComment('');
            setDestination('');
            setImage(null);
            setStartDate(new Date());
            setEndDate(new Date());
            setStartDateString('Departure date');
            setEndDateString('Return date');
            setPickedStart(false);
            setPickedEnd(false);
            setLoading(false);
        }
        getTripData();
    }, [isOpen]);

    const handleTitleLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        setInputWidth(width);
    };

    const toggleStartDatePicker = () => {
        setShowStartPicker(!showStartPicker);
    };

    const toggleEndDatePicker = () => {
        setShowEndPicker(!showEndPicker);
    };

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

    const addComponent = () => {
        setComponents([...components, { type: 'comment', id: generateUniqueId(), value: '' }]);
        setTabOrder([...tabOrder, 'comment']);
    };

    const takePhoto = async () => {
        try {
            await ImagePicker.requestCameraPermissionsAsync();
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0,
            });

            if (!result.canceled) {
                const newImages = result.assets.map((asset) => ({
                    type: 'image',
                    uri: asset.uri,
                    id: generateUniqueId()
                }));
                setComponents([...components, ...newImages]);
                setTabOrder([...tabOrder, 'image']);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const pickImage = async () => {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0,
        });

        if (!result.canceled) {
            const newImages = result.assets.map((asset) => ({
                type: 'image',
                uri: asset.uri,
                id: generateUniqueId()
            }));
            setComponents([...components, ...newImages]);
            setTabOrder([...tabOrder, 'image']);
        }
    };

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
                    onPress: () => pickImage(),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    const uploadImageToStorage = async (imageUri) => {
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const storageRef = ref(storage, `images/${new Date().toISOString()}_${generateUniqueId()}`);
            await uploadBytes(storageRef, blob);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            throw error;
        }
    };

    const handleDestinationFocus = () => {
        setIsInputActive(true);
    };

    const handleDestinationBlur = () => {
        setIsInputActive(false);
    };

    const handleDestinationSelect = (data, details = null) => {
        if (!data || !details) {
            console.error("Invalid destination data.");
            return;
        }
        setDestination(data.description);
        setIsInputActive(false);
        setGeoPoint(new GeoPoint(details.geometry.location.lat, details.geometry.location.lng));
    };

    const updateStep = async () => {
        if (!id) {
            console.error("Trip ID is missing.");
            return;
        }

        if (title && destination && startDate && endDate) {
            try {
                setLoading(true);

                const images = components
                    .filter(component => component.type === 'image')
                    .map(component => component.uri);

                const comments = components
                    .filter(component => component.type === 'comment')
                    .map(component => component.value || '');  // Default to empty string if comment is undefined

                // Upload images and get URLs
                const imageUrls = await Promise.all(images.map(uri => uploadImageToStorage(uri)));

                // Prepare the new step object
                const newStep = {
                    title: title || '',
                    destination: destination || '',
                    geopoint: geoPoint|| '',
                    startDate: startDate || new Date(),
                    endDate: endDate || new Date(),
                    comments: comments || [],
                    images: imageUrls || [],
                    tabOrder: tabOrder || [],
                };

                await setDoc(doc(db, "trips", tripId, "steps", stepId), newStep);

                // Clear the form and navigate back
                setTitle('');
                setDestination('');
                setComponents([]);
                setLoading(false);
                router.back();
            } catch (error) {
                console.error("Error while adding the document: ", error);
                setLoading(false);
            }
        } else {
            console.error("Title, Destination, Start Date, and End Date are required.");
        }
    }

    const handleCommentChange = (text, id) => {
        setComponents(prevComponents =>
            prevComponents.map(component =>
                component.id === id ? { ...component, value: text } : component
            )
        );
    };

    const removeComponent = (id) => {
        setComponents(prevComponents => prevComponents.filter(component => component.id !== id));
        setTabOrder(prevTabOrder => prevTabOrder.filter((_, index) => components[index]?.id !== id));
    };


    return (
        <View style={styles.container}>
            <View style={styles.safeAreaView}>
                <SafeAreaView style={[{ marginBottom: -20, zIndex: 2 }, AndroidSafeArea.AndroidSafeArea]}>
                    <View style={styles.header}>
                        <View style={styles.buttons}>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Feather name="arrow-left" size={30} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => updateStep()} disabled={loading}>
                            {loading ? (
                                    <>
                                        <ActivityIndicator size="small" color="white" />
                                    </>
                                ) : (
                                    <Entypo name="save" size={30} color="white" />
                                )}
                                
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Input size="xl" variant='rounded' style={{ marginBottom: 15 }}>
                            <InputField
                                placeholder="Title"
                                style={styles.inputField}
                                onChangeText={setTitle}
                                value={title}
                                onLayout={handleTitleLayout} />
                        </Input>

                        <GooglePlacesAutocomplete
                            ref={useRefReact}
                            placeholder="Destination"
                            value={destination}
                            minLength={2}
                            fetchDetails={true}
                            onPress={handleDestinationSelect}
                            onFocus={handleDestinationFocus}
                            onBlur={handleDestinationBlur}
                            query={{
                                key: GOOGLE_MAPS_API_KEY,
                                language: 'en',
                            }}
                            styles={{
                                container: { flex: 1, zIndex: 2, marginBottom:45 + 15, borderRadius: 100 },
                                textInput: styles.textInput,
                                listView: styles.listView,
                                row: { width: inputWidth, backgroundColor: COLORS.background_dark },
                                poweredContainer: { backgroundColor: COLORS.background_dark },
                                powered: { color: 'white' },
                                description: { color: 'white' },
                            }}
                        />

                        <View style={[styles.dateContainer, {marginBottom : Platform.OS === "android" ? 40 : 0}]}>
                            <TouchableOpacity onPress={toggleStartDatePicker} style={[styles.dateInput, { marginRight: 20 }]}>
                                <Input variant="rounded" size="xl" pointerEvents="none">
                                    <InputSlot>
                                        <InputIcon as={CalendarDaysIcon} style={styles.icon} />
                                    </InputSlot>
                                    <InputField
                                        value={pickedStart ? startDateString : 'Departure date'}
                                        editable={false}
                                        style={styles.inputField}
                                    />
                                </Input>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={toggleEndDatePicker} style={styles.dateInput}>
                                <Input variant="rounded" size="xl" pointerEvents="none">
                                    <InputSlot>
                                        <InputIcon as={CalendarDaysIcon} style={styles.icon} />
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

                        {showEndPicker && Platform.OS === 'android' && (
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
                    </View>
                </SafeAreaView>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexOne}>
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {components.map((component) => {
                    return (
                        <View key={component.id} style={styles.componentContainer}>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => removeComponent(component.id)}>
                                <Icon  as={CloseCircleIcon} size="xl" />
                            </TouchableOpacity>
                            {component.type === 'image' ? (
                                <Image source={{ uri: component.uri }} style={styles.image} />
                            ) : component.type === 'comment' ? (
                                <Textarea
                                    variant="rounded"
                                    size="lg"
                                    style={styles.inputField}
                                >
                                    <TextareaInput
                                        placeholder={`Comments`}
                                        onChangeText={(text) => handleCommentChange(text, component.id)}
                                        value={component.value}
                                    />
                                </Textarea>
                            ) : null}
                        </View>
                    );
                })}


                <View style={styles.buttonContainer}>
                    <Button size="md" variant="outline" action="primary" style={styles.buttonStyle} onPress={pickImage}>
                        <ButtonText>Add Image</ButtonText>
                    </Button>

                            <Button size="xl" variant="outline" action="primary" style={styles.buttonStyle} onPress={addComponent}>
                                <ButtonText>Add Comments</ButtonText>
                            </Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    safeAreaView: {
        flex: 1
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputField: {
        color: 'white',
        marginVertical: 10
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    dateInput: {
        flex: 1,
    },
    textInput: {
        height: 45,
        borderWidth: 1,
        backgroundColor: COLORS.background_dark,
        borderRadius: 25,
        color: "white",
        borderColor: "#505050",
        fontSize: 17,
    },
    listView: {
        position: 'absolute',
        top: 40,
        backgroundColor: COLORS.background_dark,
        width: '100%',
        borderRadius: 10,
        borderColor: '#131313',
        borderWidth: 2,
        color: 'white',
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    image: {
        width: '100%',
        height: 200,
        marginVertical: 10,
        borderRadius: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    buttonStyle: {
        width: '45%',
        backgroundColor: COLORS.blue,
        borderRadius: 25,
    },
    loadingText: {
        marginLeft: 10,
    },
    icon: {
        color: "#505050",
        marginLeft: 10,
    },
    flexOne: {
        flex: 1,
    },
    componentContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    deleteButton: {
        position: 'absolute',
        top: 15,
        right: 5,
        zIndex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 50,
        padding: 5,
    },
    textInput: {
        height: 35,
        borderWidth: 1,
        paddingHorizontal: 10,
        backgroundColor: COLORS.background_dark,
        borderRadius: 25,
        color: "white",
        borderColor: "#505050"
    },
    listView: {
        position: 'absolute',
        top: 40,
        backgroundColor: 'white',
        zIndex: 3,
    },
    header: {
        marginBottom: 10,
    }
});

export default UpdateStep;