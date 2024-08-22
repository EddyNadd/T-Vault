import React from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Header from '../../../components/Header';
import { FontAwesome5 } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';

const trips = () => {
  const CustomButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={() => alert('Add trip')}>
      <FontAwesome5 name="plus" size={20} color="white" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        logoSource={require('../../../assets/logo_transparent_bg.png')}
        title="MY TRIPS"
        ButtonComponent={CustomButton}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {[...Array(10)].map((_, index) => (
          <View
            key={index}
            style={[styles.color, { backgroundColor: COLORS.blue, opacity: 1 - index * 0.05 }]}
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
  color: {
    width: '100%',
    height: 150,
    borderRadius: 25,
    marginBottom: 15,
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

export default trips;