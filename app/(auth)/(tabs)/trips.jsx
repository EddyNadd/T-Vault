import { View, Button, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import AddTripActionSheet from '../../../components/AddTrip'; // Assurez-vous que ce chemin est correct.

export default function Trips() {
    const [showActionsheet, setShowActionsheet] = useState(false);

    const toggleActionSheet = () => {
        setShowActionsheet(!showActionsheet);
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E1E' }}>
            <View style={styles.buttonContainer}>
                <Button title="Add Trip" onPress={toggleActionSheet} />
            </View>
            
            <AddTripActionSheet isOpen={showActionsheet} onClose={toggleActionSheet} />
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
});
