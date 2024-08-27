import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, View } from "react-native";
import Header from '../../../components/Header';
import AddTripActionSheet from '../../../components/AddTrip';
import { FontAwesome5 } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import TripCard from '../../../components/TripCard';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../../firebase';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [showActionsheet, setShowActionsheet] = useState(false);

  const toggleActionSheet = () => {
    setShowActionsheet(!showActionsheet);
  };

  const CustomButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={toggleActionSheet}>
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

    const invitQuery = query(
      collection(db, "trips"),
      where('invitWrite', 'array-contains', auth.currentUser.uid)
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

    const unsubscribeOwner = onSnapshot(ownerQuery, async (snapshot) => {
      const ownerTrips = await Promise.all(snapshot.docs.map(async (doc) => {
        const tripData = doc.data();
        return {
          id: doc.id,
          ...tripData,
        };
      }));

      const unsubscribeShared = onSnapshot(sharedQuery, async (snapshot) => {
        const sharedTrips = await Promise.all(snapshot.docs.map(async (doc) => {
          const tripData = doc.data();
          return {
                id: doc.id,
                ...tripData,
          };
        })
      );

        const unsubscribeInvit = onSnapshot(invitQuery, async (snapshot) => {
          const invitQuery = await Promise.all(snapshot.docs.map(async (doc) => {
            const tripData = doc.data();
            return {
              id: doc.id,
              ...tripData,
            };
          }));
        
        const sortedTrips = [...ownerTrips, ...sharedTrips].sort((a, b) => b.startDate.seconds - a.startDate.seconds);
        const sortedInvit = invitQuery.sort((a, b) => b.startDate.seconds - a.startDate.seconds).filter((trip) => !trip.canWrite.includes(auth.currentUser.uid));
        const uniqueTrips = Array.from(new Set([...sortedInvit, ...sortedTrips].map((trip) => trip.id)))
          .map((id) => [...sortedInvit, ...sortedTrips ].find((trip) => trip.id === id));

        const userUids = Array.from(new Set(uniqueTrips.map((trip) => trip.uid)));
        await fetchUsers(userUids).then((users)=>{
          const enrichedTrips = uniqueTrips.map((trip) => ({
            ...trip,
            username: users[trip.uid],
          }));
          setTrips([ ...enrichedTrips ]);
        });
      });

      return () => { unsubscribeInvit(); };
    });

      return () => { unsubscribeShared(); };
    });

    return () => { unsubscribeOwner(); };
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
          if (trip.canWrite.length > 0 || trip.canRead.length > 0 || trip.shared) {
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
              shared={(trip.canWrite.length > 0 || trip.canRead.length > 0 || trip.shared) ? "users" : "user"}
              isInvitation={trip.invitWrite != null ? trip.invitWrite.includes(auth.currentUser.uid) && !trip.canWrite.includes(auth.currentUser.uid) && trip.uid != auth.currentUser.uid : false}
              tripCode={trip.id}
              editableTrip={true}
            />
          );
        })}
      </ScrollView>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E1E' }}>
        <AddTripActionSheet isOpen={showActionsheet} onClose={toggleActionSheet} />
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
});

export default Trips;
