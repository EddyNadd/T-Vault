import React, { useEffect, useState } from 'react';
import { ImageBackground, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

const TripCard = ({ imageSource, title, owner, startDate, endDate, shared, isInvitation, tripCode, editableTrip }) => {

    const [opacity, setOpacity] = useState(1);
    useEffect(() => {
        if (isInvitation) {
            setOpacity(0.3);
        } else {
            setOpacity(1);
        }
    }, [isInvitation]);

    const handleTickPress = async (tripCode) => {
        try {
            const tripRef = doc(db, "trips", tripCode);
            if(editableTrip) {
                await updateDoc(tripRef, {
                    canWrite: arrayUnion(auth.currentUser.uid),
                    invitWrite: arrayRemove(auth.currentUser.uid)
                });
            } else {
                await updateDoc(tripRef, {
                    canRead: arrayUnion(auth.currentUser.uid),
                    invitRead: arrayRemove(auth.currentUser.uid)
                });
            }
        } catch (error) {
            console.log("Error adding trip: ", error);
        }
    };

    const handleCrossPress = async (tripCode) => {
        try {
            const tripRef = doc(db, "trips", tripCode);
            if(editableTrip) {
                await updateDoc(tripRef, {
                    invitWrite: arrayRemove(auth.currentUser.uid)
                });
            } else {
                await updateDoc(tripRef, {
                    invitRead: arrayRemove(auth.currentUser.uid)
                });
            }
        } catch (error) {
            console.log("Error adding trip: ", error);
        }
    };

    return (
        <View style={styles.cardContainer}>
            <ImageBackground
                source={imageSource}
                style={[styles.tripComponents, { opacity: opacity }]}
                imageStyle={{ borderRadius: 25 }}
            >
                <View style={styles.textContainer}>
                    <Text style={styles.tripTitle}>{title}</Text>
                    <Text style={styles.tripOwner}>{owner}</Text>
                    <View style={styles.infosContainer}>
                        <View style={styles.datesContainer}>
                            <MaterialCommunityIcons style={{ transform: [{ rotate: '20deg' }] }} name="airplane" size={20} color="white" />
                            <Text style={styles.tripDates}> {startDate}</Text>
                            <MaterialCommunityIcons style={{ marginLeft: 25, transform: [{ rotate: '70deg' }] }} name="airplane" size={20} color="white" />
                            <Text style={styles.tripDates}> {endDate}</Text>
                        </View>
                        <FontAwesome name={shared} size={20} color="white" />
                    </View>
                </View>
            </ImageBackground>
            {isInvitation && (
                <View style={styles.overlayContainer}>
                    <TouchableOpacity style={styles.tickButtonOverlay} onPress={() => handleTickPress(tripCode)}>
                        <FontAwesome name="check" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.crossButtonOverlay} onPress={() => handleCrossPress(tripCode)}>
                        <FontAwesome name="times" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        height: 150,
        borderRadius: 25,
        marginBottom: 25,
        justifyContent: 'flex-end',
        position: 'relative',
    },

    tripComponents: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
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

    buttonsContainer: {
        flexDirection: 'row',
    },

    button: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },

    tickButton: {
        backgroundColor: 'green',
        marginRight: 10,
    },

    crossButton: {
        backgroundColor: 'red',
    },

    overlayContainer: {
        position: 'absolute',
        top: 15,
        right: 15,
        flexDirection: 'row',
    },

    tickButtonOverlay: {
        backgroundColor: 'green',
        padding: 8,
        borderRadius: 5,
        marginRight: 10,
    },

    crossButtonOverlay: {
        backgroundColor: 'red',
        padding: 8,
        borderRadius: 5,
    },
});

export default TripCard;
