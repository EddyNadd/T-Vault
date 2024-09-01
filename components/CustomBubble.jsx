import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../styles/COLORS';

/**
 * Custom bubble component for chat messages.
 * @param {string} text - The message text.
 */
const CustomBubble = ({ text }) => {
    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <Text style={styles.text}>{text}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    bubble: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 15,
        borderBottomLeftRadius: 0,
        backgroundColor: COLORS.blue_dark,
    },
    text: {
        color: 'white',
        fontSize: 16,
    },
});

export default CustomBubble;
