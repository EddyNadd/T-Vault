import React from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import Header from '../../../components/Header';
import { FontAwesome5 } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import TripCard from '../../../components/TripCard';  // Import du composant TripCard

const discover = () => {
  const CustomButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={() => alert('Add trip')}>
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

export default discover;
