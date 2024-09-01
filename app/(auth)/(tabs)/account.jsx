import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, SafeAreaView, View, Alert, KeyboardAvoidingView, ScrollView } from "react-native";
import Header from '../../../components/Header';
import { getAuth, updateProfile, updateEmail as updateFirebaseEmail, updatePassword as updateFirebasePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { doc, deleteDoc, setDoc, getDocs, query, collection, where, documentId } from 'firebase/firestore';
import { db } from "../../../firebase.jsx";
import { useFirestoreListeners } from '../../../components/FirestoreListenerContext';
import AndroidSafeArea from '../../../styles/AndroidSafeArea';

const Account = () => {
  const auth = getAuth();
  const [username, setUsername] = useState('');
  const [oldUsername, setOldUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorText, setErrorText] = useState("");

  const [isUsernameButtonEnabled, setIsUsernameButtonEnabled] = useState(false);
  const [isEmailButtonEnabled, setIsEmailButtonEnabled] = useState(false);
  const [isPasswordButtonEnabled, setIsPasswordButtonEnabled] = useState(false);

  const { unsubscribeAllListeners } = useFirestoreListeners();

 /**
  * Initialize the username and email fields with the current user's data
  */
  useEffect(() => {
    setUsername(auth.currentUser.displayName);
    setOldUsername(auth.currentUser.displayName);
    setEmail(auth.currentUser.email);
  }, []);

  /**
   * Enable the update button when the username is different from the current one
   */
  useEffect(() => {
    setIsUsernameButtonEnabled(username !== auth.currentUser.displayName);
  }, [username]);

  /**
   * Enable the update button when the email is different from the current one
   */
  useEffect(() => {
    setIsEmailButtonEnabled(email !== auth.currentUser.email);
  }, [email]);

  /**
   * Enable the update button when the old password, new password or confirm password fields are not empty
   */
  useEffect(() => {
    setIsPasswordButtonEnabled(
      oldPassword !== '' || newPassword !== '' || confirmPassword !== ''
    );
  }, [oldPassword, newPassword, confirmPassword]);

  /**
   * Handle the username update
   */
  const updateUsername = async () => {
    try {
      requestedUser = await getDocs(query(collection(db, "Users"), where(documentId(), "==", username)));
      if (!requestedUser.empty) {
        throw new Error("Username already exists!");
      }

      await updateProfile(auth.currentUser, { displayName: username });

      await deleteDoc(doc(db, 'Users', oldUsername));

      await setDoc(doc(db, 'Users', username), { uid: auth.currentUser.uid });

      await setDoc(doc(db, 'UID', auth.currentUser.uid), { username: username });

      Alert.alert('Success', 'Username updated successfully');
      setOldUsername(username);
      setIsUsernameButtonEnabled(false);
    } catch (error) {
      if (error.message === "Username already taken!") {
        setErrorText("Username already exists!");
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  /**
   * Handle the email update
   */
  const updateEmail = async () => {
    try {
      const user = auth.currentUser;
      await updateFirebaseEmail(user, email);
      setIsEmailButtonEnabled(false);
      Alert.alert('Success', 'Email updated successfully');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorText("The email address is already in use by another account.");
      } else if (error.code === 'auth/invalid-email') {
        setErrorText("The email address is badly formatted.");
      }
      else {
        Alert.alert('Error', error.message);
      }
    }
  };

  /**
   * Handle the password update
   */
  const updatePassword = async () => {
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      } else if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }
      await updateFirebasePassword(user, newPassword);
      Alert.alert('Success', 'Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordButtonEnabled(false);
    } catch (error) {
      if (error.code === 'auth/weak-password') {
        setErrorText("Password must be at least 6 characters long.");
      } else if (error.message === "Passwords do not match") {
        setErrorText("Passwords do not match.");
      } else {
        Alert.alert('Error', error.message);
      }
    }finally{ 
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordButtonEnabled(false)}
  }
    ;

  /**
   * Function to return the button style based on the isEnabled parameter
   * @param {boolean} isEnabled 
   */
  const getButtonStyle = (isEnabled) => ({
    ...styles.button,
    ...(isEnabled ? styles.buttonShadow : {}),
  });

  /**
   * Function to sign out the user
   */
  const signOut = () => {
    unsubscribeAllListeners();
    auth.signOut();
  };

  /**
   * Custom button component for the header
   */
  const CustomButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={() => signOut()}>
      <MaterialCommunityIcons name="logout" size={50} color={COLORS.blue} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, AndroidSafeArea.AndroidSafeArea]}>
      <Header
        logoSource={require('../../../assets/logo_transparent_bg.png')}
        title="ACCOUNT"
        ButtonComponent={CustomButton}
      />
      <KeyboardAvoidingView behavior='padding'>
      <ScrollView 
          contentContainerStyle={styles.scrollViewContent}>
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
    width: '90%',
    marginBottom: 30,
    backgroundColor: COLORS.blue_dark,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
  },
  input: {
    width: '90%',
    marginBottom: 10,
  },
  buttonShadow: {
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    backgroundColor: COLORS.blue,
  }
});

export default Account;
