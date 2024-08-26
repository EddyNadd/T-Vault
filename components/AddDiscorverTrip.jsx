import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Animated, StyleSheet, TouchableWithoutFeedback, View, Text, Platform } from 'react-native';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper } from '@/components/ui/actionsheet';
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button"
import { CodeField, useClearByFocusCell, Cursor, useBlurOnFulfill } from 'react-native-confirmation-code-field';
import { auth, db } from '../firebase';
import { updateDoc, arrayUnion, doc } from 'firebase/firestore';

export default function AddDiscoverTrip({ isOpen, onClose }) {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });
    const ref = useBlurOnFulfill({ value, cellCount: 6 });

    const addDiscoverTrip = async () => {
        setLoading(true);
        try {
            const tripRef = doc(db, "trips", value.toLocaleLowerCase());
            await updateDoc(tripRef, {
                canRead: arrayUnion(auth.currentUser.uid)
            });
            onClose();
        } catch (error) {
            console.log("Error adding trip: ", error);
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <ActionsheetBackdrop />
            <ActionsheetContent>
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View>
                        <View style={styles.buttonContainer}>
                            <Text style={styles.text}>TRIP CODE</Text>
                        </View>
                        <CodeField
                            ref={ref}
                            {...props}
                            value={value}
                            onChangeText={setValue}
                            cellCount={6} renderCell={({ index, symbol, isFocused }) => (
                                <Text
                                    key={index}
                                    style={[styles.cell, isFocused && styles.focusCell, { color: "#9e9e9e" }]}
                                    onLayout={getCellOnLayoutHandler(index)}>
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            )}></CodeField>
                        <Animated.View style={[styles.buttonContainer, { marginBottom: animatedMargin }]}>
                            {loading ? (
                                <>
                                    <Button variant="outline" disabled={true}>
                                        <ButtonSpinner />
                                        <ButtonText> Please wait...</ButtonText>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onPress={addDiscoverTrip} size="md" variant="outline" action="primary">
                                        <ButtonText>Add</ButtonText>
                                    </Button>
                                </>
                            )}
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </ActionsheetContent>
        </Actionsheet>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, padding: 20 },
    title: { textAlign: 'center', fontSize: 30 },
    cell: {
        width: 40,
        height: 40,
        lineHeight: 38,
        fontSize: 24,
        borderWidth: 2,
        borderColor: '#9e9e9e',
        textAlign: 'center',
        borderRadius: 10,
        margin: 10
    },
    focusCell: {
        borderColor: 'white',
    },
    text: {
        color: 'white',
        fontSize: 40,
        font: 'Anton',
        fontWeight: 'bold',
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
});