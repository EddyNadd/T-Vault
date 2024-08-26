import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { CalendarDaysIcon } from "@/components/ui/icon";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { CloseCircleIcon, CheckCircleIcon } from '@/components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

const AddStep = () => {
    const [startDateString, setStartDateString] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [endDateString, setEndDateString] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [pickedStart, setPickedStart] = useState(false);
    const [pickedEnd, setPickedEnd] = useState(false);
    const [components, setComponents] = useState([]);
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
        setComponents([...components, { type: 'comment', id: components.length + 1 }]);
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
                id: components.length + 1
            }));
            setComponents([...components, ...newImages]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.button}>
                <Button size="lg" variant="link" action="primary" onPress={() => router.replace('../(tabs)/trips')}>
                    <ButtonIcon as={CloseCircleIcon} size="xl" />
                </Button>

                <Button size="lg" variant="link" action="primary" onPress={() => router.replace('../(tabs)/trips')}>
                    <ButtonIcon as={CheckCircleIcon} size="xl" />
                </Button>
            </View>

            <View style={styles.title}>
                <Input>
                    <InputField placeholder="Title" style={styles.inputField} />
                </Input>
            </View>

            <View style={styles.destination}>
                <Input>
                    <InputField placeholder="Destination" style={styles.inputField} />
                </Input>
            </View>

            <View style={styles.date}>
                <TouchableOpacity onPress={toggleStartDatePicker} style={styles.fullWidthInput}>
                    <Input variant="rounded" size="lg" pointerEvents="none">
                        <InputSlot>
                            <CalendarDaysIcon className="text-typography-500 m-2 w-4 h-4" />
                        </InputSlot>
                        <InputField
                            value={pickedStart ? startDateString : 'Departure date'}
                            editable={false}
                            style={styles.inputField}
                        />
                    </Input>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleEndDatePicker} style={styles.fullWidthInput}>
                    <Input variant="rounded" size="lg" pointerEvents="none">
                        <InputSlot>
                            <CalendarDaysIcon className="text-typography-500 m-2 w-4 h-4" />
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
                    display="spinner"
                    mode="date"
                    value={startDate}
                    onChange={onChangeStart}
                />
            )}
            {showEndPicker && Platform.OS === 'android' && (
                <DateTimePicker
                    display="spinner"
                    mode="date"
                    value={endDate}
                    onChange={onChangeEnd}
                />
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

                <View style={styles.button}>
                    <Button size="md" variant="outline" action="primary" onPress={pickImage}>
                        <ButtonText>Add Image</ButtonText>
                    </Button>

                    <Button size="md" variant="outline" action="primary" onPress={addComponent}>
                        <ButtonText>Add Comments</ButtonText>
                    </Button>
                </View>
            </ScrollView>
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
    title: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    destination: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    date: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    fullWidthInput: {
        flex: 1,
        marginRight: 10,
    },
    inputField: {
        color: '#ffffff',
        marginBottom: 10,
        marginTop: 10,
    },

    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        marginTop: 20,
    },

    scrollContainer: {
        marginTop: 20,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 10,
    },
});
