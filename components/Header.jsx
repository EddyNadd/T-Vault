import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import COLORS from '../styles/COLORS';

/**
 * Header component for the application.
 * @param {string} props.logoSource - The source of the logo image.
 * @param {string} props.title - The title of the header.
 * @param {React.Component} props.ButtonComponent - The component to render on the right side of the header. 
 */
const Header = ({ logoSource, title, ButtonComponent }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.sideContainer}>
        <Image source={logoSource} style={styles.logo} testID="header-logo"/>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.sideContainer}>
        {ButtonComponent && <ButtonComponent />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background_dark,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sideContainer: {
    flex: 1, // Chaque côté prend 1/3 de l'espace disponible
    alignItems: 'center',
  },
  titleContainer: {
    flex: 2, // Le titre prend plus de place
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,  // Taille ajustée pour le logo
    height: 80,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Header;
