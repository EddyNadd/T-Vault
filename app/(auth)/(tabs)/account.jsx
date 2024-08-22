import React from 'react';
import { TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import Header from '../../../components/Header';
import { auth } from '../../../firebase.jsx'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';

const account = () => {
  const CustomButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={() => auth.signOut()}>
      <MaterialCommunityIcons name="logout" size={50} color={COLORS.blue} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        logoSource={require('../../../assets/logo_transparent_bg.png')}
        title="ACCOUNT"
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

  color: {
    width: '100%',
    height: 150,
    borderRadius: 25,
    marginBottom: 15,
  },
});

export default account;