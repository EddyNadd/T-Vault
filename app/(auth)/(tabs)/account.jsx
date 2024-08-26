import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, SafeAreaView, View, Alert, KeyboardAvoidingView, ScrollView } from "react-native";
import Header from '../../../components/Header';
import { getAuth, updateProfile, updateEmail as updateFirebaseEmail, updatePassword as updateFirebasePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from "../../../firebase.jsx";

const Account = () => {
  const auth = getAuth();
  const [username, setUsername] = useState(auth.currentUser.displayName || '');
  const [oldUsername, setOldUsername] = useState(auth.currentUser.displayName || '');
  const [email, setEmail] = useState(auth.currentUser.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUsernameButtonEnabled, setIsUsernameButtonEnabled] = useState(false);
  const [isEmailButtonEnabled, setIsEmailButtonEnabled] = useState(false);
  const [isPasswordButtonEnabled, setIsPasswordButtonEnabled] = useState(false);

  useEffect(() => {
    setIsUsernameButtonEnabled(username !== auth.currentUser.displayName);
  }, [username]);

  useEffect(() => {
    setIsEmailButtonEnabled(email !== auth.currentUser.email);
  }, [email]);

  useEffect(() => {
    setIsPasswordButtonEnabled(
      oldPassword !== '' || newPassword !== '' || confirmPassword !== ''
    );
  }, [oldPassword, newPassword, confirmPassword]);

  const updateUsername = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: username });

      await deleteDoc(doc(db, 'Users', oldUsername));

      await setDoc(doc(db, 'Users', username), { uid: auth.currentUser.uid });

      await setDoc(doc(db, 'UID', auth.currentUser.uid), { username: username });

      setOldUsername(username);

      Alert.alert('Success', 'Username updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const updateEmail = async () => {
    try {
      const user = auth.currentUser;
      await updateFirebaseEmail(user, email);
      Alert.alert('Success', 'Email updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updateFirebasePassword(user, newPassword);
      Alert.alert('Success', 'Password updated successfully');
      setOldPassword(newPassword);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const getButtonStyle = (isEnabled) => ({
    ...styles.button,
    ...(isEnabled ? styles.buttonShadow : {}),
  });

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
      <KeyboardAvoidingView behavior='padding'>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.info}>
            <View style={styles.input}>
              <Input variant='rounded'>
                <InputField
                  label="UserName"
                  value={username}
                  onChangeText={setUsername}
                />
              </Input>
            </View>

            <View style={getButtonStyle(isUsernameButtonEnabled)}>
              <Button
                size="md"
                variant="link"
                action="primary"
                isDisabled={!isUsernameButtonEnabled}
                onPress={updateUsername}
              >
                <ButtonText style={styles.buttonText}>Edit Username</ButtonText>
              </Button>
            </View>

            <View style={styles.input}>
              <Input variant='rounded'>
                <InputField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                />
              </Input>
            </View>

            <View style={getButtonStyle(isEmailButtonEnabled)}>
              <Button
                size="md"
                variant="link"
                action="primary"
                isDisabled={!isEmailButtonEnabled}
                onPress={() => {
                  if (email) {
                    updateEmail();
                  } else {
                    Alert.alert('Error', 'Please fill in all fields.');
                  }
                }}
              >
                <ButtonText style={styles.buttonText}>Edit Email</ButtonText>
              </Button>
            </View>

            <View style={styles.input}>
              <Input variant='rounded'>
                <InputField
                  label="Old Password"
                  placeholder='Old Password'
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={true}
                />
              </Input>
            </View>

            <View style={styles.input}>
              <Input variant='rounded'>
                <InputField
                  label="New Password"
                  placeholder='New Password'
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={true}
                />
              </Input>
            </View>

            <View style={styles.input}>
              <Input variant='rounded'>
                <InputField
                  label="Confirm Password"
                  placeholder='Confirm Password'
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={true}
                />
              </Input>
            </View>

            <View style={getButtonStyle(isPasswordButtonEnabled)}>
              <Button
                size="md"
                variant="link"
                action="primary"
                isDisabled={!isPasswordButtonEnabled}
                onPress={updatePassword}
              >
                <ButtonText style={styles.buttonText}>Edit Password</ButtonText>
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background_dark,
  },
  info: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '85%',
    marginBottom: 50,
    backgroundColor: COLORS.blue_dark,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
  },
  input: {
    width: '85%',
    marginBottom: 10,
  },

  buttonShadow: {
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    backgroundColor: COLORS.blue,
  },
});

export default Account;
