import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet, ScrollView, Image, SafeAreaView, Dimensions, Linking } from 'react-native';
import COLORS from '../styles/COLORS';
import AndroidSafeArea from '../styles/AndroidSafeArea';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const maxLogoWidth = screenWidth * 0.8;

const AboutUs = () => {
  const router = useRouter();
  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={AndroidSafeArea.AndroidSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={30} color="white" />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.heading}>SCHOOL PROJECT</Text>
          <Text style={styles.text}>
            This project was carried out as part of the "Hes d'été" module during our third year of bachelor studies at HE-ARC Neuchâtel in Switzerland.
          </Text>
          <Text style={styles.text}>
            The project supervisors are Benoît Le Callennec and Julien Senn.
          </Text>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/He-arc.png')}
              style={styles.logoImage}
              resizeMode='contain'
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Our Team</Text>
          <View style={styles.teamMember}>
            <Text style={styles.memberName}>David Jaton</Text>
            <Text style={styles.memberRole}>Bachelor Student</Text>
            <MaterialCommunityIcons name="school" size={40} color="white" />
          </View>
          <View style={styles.teamMember}>
            <Text style={styles.memberName}>Eddy Naddeo</Text>
            <Text style={styles.memberRole}>Bachelor Student</Text>
            <MaterialCommunityIcons name="school" size={40} color="white" />
          </View>
          <View style={styles.teamMember}>
            <Text style={styles.memberName}>Villarejo Maxime</Text>
            <Text style={styles.memberRole}>Bachelor Student</Text>
            <MaterialCommunityIcons name="school" size={40} color="white" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Project Repository</Text>
          <Text style={styles.text} onPress={() => Linking.openURL('https://gitlab-etu.ing.he-arc.ch/isc/2024-25/niveau-3/3281.1-projet-p3-hes-ete-il/g4/t-vault')}>
            <Text style={styles.link}>Link to gitlab project repository</Text>
          </Text>
          <Text style={styles.text}></Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },

  section: {
    marginBottom: 30,
    width: '100%',
    paddingHorizontal: 20,
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.blue,
    marginBottom: 10,
  },

  text: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 10,
  },

  logoContainer: {
    alignItems: 'center',
    width: maxLogoWidth,
    marginBottom: 20,
  },

  logoImage: {
    width: '60%',
    height: maxLogoWidth * 0.2,
  },

  teamMember: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: COLORS.blue_dark,
    width: 200,
    alignSelf: 'center',
    borderRadius: 100,
    justifyContent: 'center',
    height: 200,
  },

  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },

  memberRole: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },

  link: {
    color: 'white',
    textDecorationLine: 'underline',
  },
});

export default AboutUs;
