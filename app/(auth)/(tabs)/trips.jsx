import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import Header from '../../../components/Header';
import { FontAwesome5 } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import TripCard from '../../../components/TripCard';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../../firebase';

const Trips = () => {
  const [trips, setTrips] = useState([]); // État pour stocker les voyages

  const CustomButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={() => alert('Add trip')}>
      <FontAwesome5 name="plus" size={20} color="white" />
    </TouchableOpacity>
  );

  useEffect(() => {
    const requestTrip = async () => {
      const ownerQuery = query(
        collection(db, "trips"),
        where('uid', '==', auth.currentUser.uid)
      );
      const requestedTrip = await getDocs(ownerQuery);
      const ownerTrips = requestedTrip.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrips(ownerTrips); // Mise à jour de l'état avec les voyages
    };

    requestTrip();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        logoSource={require('../../../assets/logo_transparent_bg.png')}
        title="MY TRIPS"
        ButtonComponent={CustomButton}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            imageSource={{ uri: trip.image }}
            title={trip.title}
            owner={trip.shared ? `Trip shared by ${trip.uid}` : "My trip"}
            startDate={new Date(trip.startDate.seconds * 1000).toLocaleDateString()}
            endDate={new Date(trip.endDate.seconds * 1000).toLocaleDateString()}
            shared={trip.shared ? "users" : "user"}
          />
        ))}
      </ScrollView>
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
});

export default Trips;
