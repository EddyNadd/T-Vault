import React, { useState, useEffect } from 'react';
import { SafeAreaView, TouchableOpacity, StyleSheet, View, ScrollView } from "react-native";
import Header from '../../../components/Header';
import { FontAwesome5 } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import AddDiscoverTrip from '../../../components/AddDiscorverTrip'
import TripCard from '../../../components/TripCard';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../../firebase';

const discover = () => {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [trips, setTrips] = useState([]);

  const toggleActionSheet = () => {
    setShowActionsheet(!showActionsheet);
  };

  useEffect(() => {
    const sharedQuery = query(
      collection(db, "trips"),
      where('canRead', 'array-contains', auth.currentUser.uid)
    );

    const unsubscribeShared = onSnapshot(sharedQuery, async (snapshot) => {
      const sharedTrips = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((trip) => (!trip.canWrite.includes(auth.currentUser.uid) && trip.uid != auth.currentUser.uid));  // Exclude trips where the user is in canWrite

      setTrips(sharedTrips);
    });

    return () => unsubscribeShared();
  }, []);

  const CustomButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={toggleActionSheet}>
      <FontAwesome5 name="plus" size={20} color="white" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        logoSource={require('../../../assets/logo_transparent_bg.png')}
        title="DISCOVER"
        ButtonComponent={CustomButton}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {trips.map((trip) => {
          let ownerLabel = "My trip";
          if (trip.canWrite.length > 0 || trip.canRead.length > 0 || trip.shared) {
            if (trip.uid === auth.currentUser.uid) {
              ownerLabel = "My trip (shared)";
            } else {
              ownerLabel = `Trip shared by ${trip.username}`;
            }
          }
          return (
            <TripCard
              key={trip.id}
              imageSource={{ uri: trip.image }}
              title={trip.title}
              owner={ownerLabel}
              startDate={new Date(trip.startDate.seconds * 1000).toLocaleDateString()}
              endDate={new Date(trip.endDate.seconds * 1000).toLocaleDateString()}
              shared={(trip.canWrite.length > 0 || trip.canRead.length > 0 || trip.shared) ? "users" : "user"}
            />
          );
        })}
      </ScrollView>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E1E' }}>
        <AddDiscoverTrip isOpen={showActionsheet} onClose={toggleActionSheet} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background_dark,
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 100,
  },

  addButton: {
    backgroundColor: COLORS.blue_dark,
    padding: 5,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 100,
  },
});

export default discover;
