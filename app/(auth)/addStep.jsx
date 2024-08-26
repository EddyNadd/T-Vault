import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TouchableWithoutFeedback, Keyboard, Platform, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from "../../firebase.jsx";
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Textarea, TextareaInput } from "@/components/ui/textarea"
import { CalendarDaysIcon } from "@/components/ui/icon"
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button"
import { CloseCircleIcon, CheckCircleIcon} from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';


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
                setEndDateString(currentDate.toLocaleDateString());
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

    return (

        <SafeAreaView style={styles.container}>
            <View style={styles.button}>
            <Button size="lg" variant="link" action="primary">
                <ButtonIcon as={CloseCircleIcon}  size='xl'/>
            </Button>

            <Button size="lg" variant="link" action="primary">
                <ButtonIcon as={CheckCircleIcon} size='xl'/>
            </Button>
            </View>

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
            <View style={styles.button}>
                <Button size="md" variant="outline" action="primary">
                    <ButtonText>Add Image</ButtonText>
                </Button>

                <Button size="md" variant="outline" action="primary">
                    <ButtonText>Add Comments</ButtonText>
                </Button>
            </View>
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
        paddingBottom: 100,
    },
    title: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    destination : {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 40,
    },

    date: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    fullWidthInput: {
        flex: 1,
    },
    inputField: {
        color: '#ffffff',

    },
    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
});    