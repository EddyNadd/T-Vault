import React, { useState, useEffect } from 'react';
import { SafeAreaView, TouchableOpacity, StyleSheet, View, ScrollView } from "react-native";
import Header from '../../../components/Header';
import { FontAwesome5 } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import AddDiscoverTrip from '../../../components/AddDiscorverTrip'
import TripCard from '../../../components/TripCard';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
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

    const invitQuery = query(
      collection(db, "trips"),
      where('invitRead', 'array-contains', auth.currentUser.uid)
    );

    const fetchUsers = async (uids) => {
      if (uids.length === 0) return {};
      let users = {};
      for (const uid of uids) {
        const docRef = doc(db, 'UID', uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          users[uid] = 'Unknown';
        } else {
          users[uid] = docSnap.data().username;
        }
      }
      return users;
    };

    const unsubscribeShared = onSnapshot(sharedQuery, async (snapshot) => {
      const sharedTrips = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((trip) => (!trip.canWrite.includes(auth.currentUser.uid) && trip.uid != auth.currentUser.uid));

      const unsubscribeInvit = onSnapshot(invitQuery, async (snapshot) => {
        const invitTrips = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((trip) => (!trip.canWrite.includes(auth.currentUser.uid) && !trip.invitWrite.includes(auth.currentUser.uid) && trip.uid != auth.currentUser.uid));

        const uniqueTrips = Array.from(new Set([...sharedTrips, ...invitTrips].map((trip) => trip.id)))
          .map((id) => [...sharedTrips, ...invitTrips].find((trip) => trip.id === id));
        setTrips(uniqueTrips);
        const userUids = Array.from(new Set(uniqueTrips.map((trip) => trip.uid)));
        await fetchUsers(userUids).then((users)=>{
          const enrichedTrips = uniqueTrips.map((trip) => ({
            ...trip,
            username: users[trip.uid],
          }));
          setTrips([ ...enrichedTrips ]);
        });
      });
      return () => unsubscribeInvit();
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
              isInvitation={trip.invitRead != null ? trip.invitRead.includes(auth.currentUser.uid) && !trip.canRead.includes(auth.currentUser.uid) : false}
              tripCode={trip.id}
              editableTrip={false}
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
