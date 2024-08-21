import { View, Text, Button, Modal, TextInput, StyleSheet, Image} from 'react-native'
import React, { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

export default function Trips() {
    const [image, setImage] = useState();
    const [isModalVisible, setModalVisible] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date())
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [isStart, setIsStart] = useState(true);

    const uploadImage = async () => {
        try{
        await ImagePicker.requestMediaLibraryPermissionsAsync();
            let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.cancelled) {
            await saveImage(result.assets[0].uri);
        }

    } catch (error) {
        console.log(error);
    }
    }

    const saveImage = async (image) => {
        try{
            setImage(image);
        }
        catch (error) {
            console.log(error);
        }
    }

    const onChange = (event, selectedDate) => {
        setShow(false);
        if (isStart) {
            setStartDate(selectedDate || startDate);
        } else {
            setEndDate(selectedDate || endDate);
        }
    };

    const showMode = (currentMode, start = true) => {
        setShow(true);
        setMode(currentMode);
        setIsStart(start);
    };

    const showDatepicker = (start = true) => {
        showMode('date', start);
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    return (
        <View>
            <Button title="add" onPress={toggleModal} />
            <Modal visible={isModalVisible} transparent={true} animationType="slide">
                <View>
                    
                    <Text>Let's add your trip!</Text>
                    <View>
                    <Image source={{ uri: image }} style={styles.image}/>
                    <Button title="Choose a picture" onPress={uploadImage} style={styles.button}/>
                    </View>
                    <View>
                    <Button onPress={() => showDatepicker(true)} title="Start" style={styles.button}/>
                    <Text>Start date: {startDate.toLocaleDateString()}</Text>
                    <Button onPress={() => showDatepicker(false)} title="Return" style={styles.button} />
                    <Text>Return date: {endDate.toLocaleDateString()}</Text>
                    {show && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={isStart ? startDate : endDate}
                            mode={mode}
                            onChange={onChange}
                        />
                    )}
                    </View>
                    <View>
                    <TextInput placeholder="Destination" style = {styles.input}/>
                    </View>
                    <Button title="Hide modal" onPress={toggleModal} />
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
    },

    input: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 10,
        margin: 10,
    },
});
