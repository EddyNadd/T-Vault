import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome6 } from '@expo/vector-icons';
import COLORS from '../styles/COLORS';
import { Button, ButtonText } from '@/components/ui/button';

export default function LocationPicker({ onConfirm, onCancel, defaultLongitude, defaultLatitude }) {
    const [region, setRegion] = useState({
        latitude: defaultLatitude || 46.99763183905308,
        longitude: defaultLongitude || 6.938745394653198,
        latitudeDelta: 10,
        longitudeDelta: 10,
    });

    useEffect(() => {
        if (!defaultLatitude) {
            (async () => {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission denied', 'You need to grant location permission to use this feature.');
                    return;
                }

                let currentLocation = await Location.getCurrentPositionAsync({});
                setRegion({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            })();
        }
    }, [defaultLatitude]);

    const handleConfirm = () => {
        if (region) {
            const { latitude, longitude } = region;
            onConfirm(latitude, longitude);
        }
    };

    const handleCancel = () => {
        onCancel();
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                mapType='hybrid'
                zoomEnabled={true}
                scrollEnabled={true}
                showsUserLocation={true}
            />
            <View style={styles.iconContainer}>
                <FontAwesome6 name="crosshairs" size={24} color="white" />
            </View>
            <Button onPress={handleConfirm} size="sm" variant="outline" action="primary" style={styles.confirmButton}>
                <ButtonText>Confirm</ButtonText>
            </Button>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    iconContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -12 }, { translateY: -12 }],
        zIndex: 1,
    },
    confirmButton: {
        position: 'absolute',
        bottom: 20,
        left: "55%",
        width: '25%',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background_dark,
        borderRadius: 50
    },
    cancelButton: {
        position: 'absolute',
        bottom: 20,
        left: "18%",
        width: '25%',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background_dark,
        borderRadius: 50
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});