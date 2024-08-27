import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { CalendarDaysIcon } from "@/components/ui/icon";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { CloseCircleIcon, CheckCircleIcon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import COLORS from '@/styles/COLORS';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from '../../map';

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const AddStep = () => {
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
    const router = useRouter();

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

    const addComponent = () => {
        setComponents([...components, { type: 'comment', id: generateUniqueId() }]);
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

    const handleDestinationFocus = () => {
        setIsInputActive(true);
    };

    const handleDestinationBlur = () => {
        setIsInputActive(false);
    };

    const handleDestinationSelect = (data, details = null) => {
        console.log('Place data:', data);
        console.log('Place details:', details);
        setIsInputActive(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button size="lg" variant="link" action="primary" onPress={() => router.replace('../(tabs)/trips')}>
                    <ButtonIcon as={CloseCircleIcon} size="xl" />
                </Button>

                <Button size="lg" variant="link" action="primary" onPress={() => router.replace('../(tabs)/trips')}>
                    <ButtonIcon as={CheckCircleIcon} size="xl" />
                </Button>
            </View>

            <View style={styles.inputContainer}>
                <Input variant='rounded'>
                    <InputField placeholder="Title" style={styles.inputField} />
                </Input>
            </View>

            <View style={styles.destinationContainer}>
                <GooglePlacesAutocomplete
                    placeholder="Destination"
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
                                    <Textarea key={component.id} variant="rounded" size="lg" style={styles.inputField} >
                                        <TextareaInput placeholder={`Comments`} />
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
        maxHeight: '40%',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginVertical: 10,
    },
    textInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    listView: {
        position: 'absolute',
        top: 40,
        backgroundColor: '#fff',
        zIndex: 3,
    },
});
