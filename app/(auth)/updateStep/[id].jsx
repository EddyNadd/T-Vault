import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePickerModal from '../../../components/DatePickerModal';
import * as ImagePicker from 'expo-image-picker';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { CalendarDaysIcon } from "@/components/ui/icon";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { CloseCircleIcon, CheckCircleIcon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from "expo-router";
import COLORS from '@/styles/COLORS';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from '../../../map.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from "../../../firebase.jsx";
import { doc, setDoc } from "firebase/firestore";

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const AddStep = (isOpen, onClose) => {
    const { id } = useLocalSearchParams();
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
    const router = useRouter();


    useEffect(() => {
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
    }, [isOpen]);

    const toggleStartDatePicker = () => {
        setShowStartPicker(!showStartPicker);
    };

    const toggleEndDatePicker = () => {
        setShowEndPicker(!showEndPicker);
    };

    const onChangeStart = ({ type }, selectedDate) => {
        if (type === 'set') {
            const currentDate = selectedDate;
            setStartDate(currentDate);
            if (Platform.OS === 'android') {
                toggleStartDatePicker();
                setStartDateString(currentDate.toLocaleDateString());
                setPickedStart(true);
            }
        } else {
            toggleStartDatePicker();
        }
    };

    const onChangeEnd = ({ type }, selectedDate) => {
        if (type === 'set') {
            const currentDate = selectedDate;
            setEndDate(currentDate);
            if (Platform.OS === 'android') {
                toggleEndDatePicker();
                setEndDateString(currentDate.toLocaleDateString());
                setPickedEnd(true);
            }
        } else {
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

    const addComponent = () => {
        setComponents([...components, { type: 'comment', id: generateUniqueId(), value: '' }]);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const newImages = result.assets.map((asset) => ({
                type: 'image',
                uri: asset.uri,
                id: generateUniqueId()
            }));
            setComponents([...components, ...newImages]);
        }
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
    };

    const addStep = async () => {
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
                    startDate: startDate || new Date(),
                    endDate: endDate || new Date(),
                    comments: comments || [],
                    images: imageUrls || [],
                };

                const stepId = Math.random().toString(36).substr(2, 6);

                await setDoc(doc(db, "trips", id, "steps", stepId), newStep);

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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button size="lg" variant="link" action="primary" onPress={() => router.back()}>
                    <ButtonIcon as={CloseCircleIcon} size="xl" />
                </Button>

                <Button size="lg" variant="link" action="primary" onPress={addStep} disabled={loading}>
                    {loading ? (
                        <>
                            <ActivityIndicator size="small" color="#fff" />
                            <ButtonText style={{ marginLeft: 10 }}>Please wait...</ButtonText>
                        </>
                    ) : (
                        <ButtonIcon as={CheckCircleIcon} size="xl" />
                    )}

                </Button>
            </View>

            <View style={styles.inputContainer}>
                <Input variant='rounded'>
                    <InputField
                        placeholder="Title"
                        style={styles.inputField}
                        onChangeText={setTitle}
                        value={title} />
                </Input>
            </View>

            <View style={styles.destinationContainer}>
                <GooglePlacesAutocomplete
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
                        container: { flex: 1, zIndex: 2 },
                        textInput: styles.textInput,
                        listView: styles.listView,
                    }}
                />
            </View>

            {!isInputActive && (
                <>
                    <View style={styles.dateContainer}>
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

                    <ScrollView style={styles.scrollContainer}>
                        {components.map((component) => {
                            if (component.type === 'image') {
                                return <Image key={component.id} source={{ uri: component.uri }} style={styles.image} />;
                            } else if (component.type === 'comment') {
                                return (
                                    <Textarea
                                        key={component.id}
                                        variant="rounded"
                                        size="lg"
                                        style={styles.inputField}
                                    >
                                        <TextareaInput placeholder={`Comments`}
                                         onChangeText={(text) => handleCommentChange(text, component.id)}
                                         value={component.value} />
                                    </Textarea>
                                );
                            }
                            return null;
                        })}

                        <View style={styles.buttonContainer}>
                            <Button size="md" variant="outline" action="primary" style={styles.buttonStyle} onPress={pickImage}>
                                <ButtonText>Add Image</ButtonText>
                            </Button>

                            <Button size="md" variant="outline" action="primary" style={styles.buttonStyle} onPress={addComponent}>
                                <ButtonText>Add Comments</ButtonText>
                            </Button>
                        </View>
                    </ScrollView>
                </>
            )}
        </SafeAreaView>
    );
};


export default AddStep;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    inputContainer: {
        marginBottom: 20,
    },
    destinationContainer: {
        zIndex: 2,
        marginBottom: 90,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    fullWidthInput: {
        flex: 1,
        marginHorizontal: 5,
    },
    inputField: {
        color: '#ffffff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    buttonStyle: {
        width: '45%',
        backgroundColor: COLORS.blue,
        borderRadius: 25,
    },
    scrollContainer: {
        marginTop: 20,
        maxHeight: '60%',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginVertical: 10,
    },
    textInput: {
        height: 35,
        borderWidth: 1,
        paddingHorizontal: 10,
        backgroundColor: COLORS.background_dark,
        borderRadius: 25,
        color: "white",
        borderColor: "#505050",
    },
    listView: {
        position: 'absolute',
        top: 40,
        backgroundColor: 'white',
        zIndex: 3,
    },
});
