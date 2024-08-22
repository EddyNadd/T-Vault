import React from 'react';
import { ImageBackground, Text, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

const TripCard = ({ imageSource, title, owner, startDate, endDate, shared }) => {
    return (
        <ImageBackground
            source={imageSource}
            style={styles.tripComponents}
            imageStyle={{ borderRadius: 25 }}
        >
            <View style={styles.textContainer}>
                <Text style={styles.tripTitle}>{title}</Text>
                <Text style={styles.tripOwner}>{owner}</Text>
                <View style={styles.infosContainer}>
                    <View style={styles.datesContainer}>
                        <MaterialCommunityIcons style={{ transform: [{ rotate: '20deg' }] }} name="airplane" size={20} color="white" />
                        <Text style={styles.tripDates}> {startDate}</Text>
                        <MaterialCommunityIcons style={{ marginLeft: 25, transform: [{ rotate: '70deg' }], }} name="airplane" size={20} color="white" />
                        <Text style={styles.tripDates}> {endDate}</Text>
                    </View>
                    <FontAwesome name={shared} size={20} color="white" />
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    tripComponents: {
        width: '100%',
        height: 150,
        borderRadius: 25,
        marginBottom: 25,
        justifyContent: 'flex-end',
    },

    textContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        padding: 10,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },

    infosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
    },

    datesContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 5,
    },

    tripTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },

    tripOwner: {
        color: 'white',
        fontSize: 15,
    },

    tripDates: {
        color: 'white',
        fontSize: 17,
    },
});

export default TripCard;
