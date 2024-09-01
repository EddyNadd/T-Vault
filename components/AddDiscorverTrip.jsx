import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Animated, StyleSheet, TouchableWithoutFeedback, View, Text, Platform } from 'react-native';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper } from '@/components/ui/actionsheet';
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button"
import { CodeField, useClearByFocusCell, Cursor, useBlurOnFulfill } from 'react-native-confirmation-code-field';
import { auth, db } from '../firebase';
import { updateDoc, arrayUnion, doc, getDoc } from 'firebase/firestore';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText, FormControlHelper } from '@/components/ui/form-control';

/**
 * Component for adding a discover trip by entering a trip code.
 * @param {boolean} isOpen - The state of the actionsheet.
 * @param {function} onClose - The function to close the actionsheet.
 */ 
export default function AddDiscoverTrip({ isOpen, onClose }) {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });
    const ref = useBlurOnFulfill({ value, cellCount: 6 });

    /**
     * Resets the value and error state when the actionsheet is opened.
     */
    useEffect(() => {
        if (isOpen) {
            setValue('');
            setError(false);
        }
    }, [isOpen]);

    /**
     * Adds a discover trip by entering a trip code.  
     */
    const addDiscoverTrip = async () => {
        setLoading(true);
        try {
            const tripRef = doc(db, "Trips", value.toLowerCase());
            const isShared = await getDoc(tripRef).then(async (doc) => {
                if (doc.data().shared) {
                    await updateDoc(tripRef, {
                        canRead: arrayUnion(auth.currentUser.uid)
                    });
                    onClose();
                } else {
                    throw new Error("Invalid trip code");
                }
            });
        } catch (error) {
            console.log("Error adding trip: ", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Animated margin for the actionsheet content.
     */
    const animatedMargin = useRef(new Animated.Value(0)).current;

    /**
     * Dismisses the keyboard.
     */
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    /**
     * Listen for keyboard events
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
     * Handles the keyboard did show event.
     * @param {*} event - The event object
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
     * Handles the keyboard did hide event.
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
                        <FormControl isInvalid={error} style={{ marginBottom: 5 }}>
                            <FormControlLabel>
                                <FormControlLabelText />
                            </FormControlLabel>
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
                            {error && (
                                <FormControlError>
                                    <FormControlErrorText>
                                        Invalid trip code
                                    </FormControlErrorText>
                                </FormControlError>
                            )}
                            <Animated.View style={[styles.buttonContainer, { marginBottom: animatedMargin }]}>
                                <Button variant="outline" disabled={loading} style={{ marginBottom: 20 }} onPress={addDiscoverTrip} >
                                    {loading ? (
                                        <>
                                            <ButtonSpinner />
                                            <ButtonText> Please wait...</ButtonText>
                                        </>
                                    ) : (
                                        <>
                                            <ButtonText>Add</ButtonText>
                                        </>
                                    )}
                                </Button>
                            </Animated.View>
                        </FormControl>
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