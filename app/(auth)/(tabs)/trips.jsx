import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import Header from '../../../components/Header';
import { FontAwesome5 } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import TripCard from '../../../components/TripCard';
import { collection, query, where, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase';

const Trips = () => {
  const [trips, setTrips] = useState([]);

  const CustomButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={() => alert('Add trip')}>
      <FontAwesome5 name="plus" size={20} color="white" />
    </TouchableOpacity>
  );

  useEffect(() => {
    const ownerQuery = query(
      collection(db, "trips"),
      where('uid', '==', auth.currentUser.uid)
    );

    const sharedQuery = query(
      collection(db, "trips"),
      where('canWrite', 'array-contains', auth.currentUser.uid)
    );

    const unsubscribeOwner = onSnapshot(ownerQuery, async (snapshot) => {
      const tripsData = await Promise.all(snapshot.docs.map(async (doc) => {
        const tripData = doc.data();
        return {
          id: doc.id,
          ...tripData,
        };
      }));
      setTrips((prevTrips) => [...prevTrips, ...tripsData]);
    });

    const unsubscribeShared = onSnapshot(sharedQuery, async (snapshot) => {
      const tripsData = await Promise.all(snapshot.docs.map(async (doc) => {
        const tripData = doc.data();
        return {
          id: doc.id,
          ...tripData,
        };
      }));
      setTrips((prevTrips) => [...prevTrips, ...tripsData]);
    });

    return () => {unsubscribeOwner(); unsubscribeShared()};
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        logoSource={require('../../../assets/logo_transparent_bg.png')}
        title="MY TRIPS"
        ButtonComponent={CustomButton}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {trips.map((trip) => {
          let ownerLabel = "My trip";
          if (trip.shared) {
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
              shared={trip.shared ? "users" : "user"}
            />
          );
        })}
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
