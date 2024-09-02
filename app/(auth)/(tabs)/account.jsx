import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, SafeAreaView, View, Alert, KeyboardAvoidingView, ScrollView, Dimensions, Text } from "react-native";
import Header from '../../../components/Header';
import { getAuth, updateProfile, updateEmail as updateFirebaseEmail, updatePassword as updateFirebasePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { doc, deleteDoc, setDoc, getDocs, query, collection, where, documentId } from 'firebase/firestore';
import { db } from "../../../firebase.jsx";
import { useFirestoreListeners } from '../../../components/FirestoreListenerContext';
import AndroidSafeArea from '../../../styles/AndroidSafeArea';
import { router } from 'expo-router';

/**
 * Account view component that displays the user's account information and allows them to update it.
 */
const Account = () => {
  const auth = getAuth();
  const [username, setUsername] = useState('');
  const [oldUsername, setOldUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorText, setErrorText] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [isUsernameButtonEnabled, setIsUsernameButtonEnabled] = useState(false);
  const [isEmailButtonEnabled, setIsEmailButtonEnabled] = useState(false);
  const [isPasswordButtonEnabled, setIsPasswordButtonEnabled] = useState(false);

  const { unsubscribeAllListeners } = useFirestoreListeners();

  /*
  * Fetch current user's data and set the state
  */
  useEffect(() => {
    setUsername(auth.currentUser.displayName);
    setOldUsername(auth.currentUser.displayName);
    setEmail(auth.currentUser.email);
  }, []);

  /*
  * Check if the username has been changed and enable the button
  */
  useEffect(() => {
    setIsUsernameButtonEnabled(username !== auth.currentUser.displayName);
  }, [username]);

  /*
  * Check if the email has been changed and enable the button
  */
  useEffect(() => {
    setIsEmailButtonEnabled(email !== auth.currentUser.email && emailPassword != "");
  }, [email, emailPassword]);

  /*
  * Check if the passwords has been changed and enable the button
  */
  useEffect(() => {
    setIsPasswordButtonEnabled(
      oldPassword !== '' || newPassword !== '' || confirmPassword !== ''
    );
  }, [oldPassword, newPassword, confirmPassword]);

  /* 
  * Update the username in the database
  */
  const updateUsername = async () => {
    setLoadingUsername(true);
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
    setLoadingUsername(false);
  };

  /*
  * Update the email in the database
  */
  const updateEmail = async () => {
    setLoadingEmail(true)
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, emailPassword);
      await reauthenticateWithCredential(user, credential);
      await updateFirebaseEmail(user, email);
      setIsEmailButtonEnabled(false);
      Alert.alert('Success', 'Email updated successfully');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorText("The email address is already in use by another account.");
      } else if (error.code === 'auth/invalid-email') {
        setErrorText("The email address is badly formatted.");
      } else if (error.code === 'auth/wrong-password') {
        setErrorText("Wrong password");
      }
      else {
        Alert.alert('Error', error.message);
      }
    }
    setEmailPassword("")
    setLoadingEmail(false)
  };

  /* 
  * Update the password in the database
  */
  const updatePassword = async () => {
    setLoadingPassword(true);
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
    } finally {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordButtonEnabled(false)
    }
    setLoadingPassword(false);
  };

  /* 
  * Get the style of the button
  */
  const getButtonStyle = (isEnabled) => ({
    ...styles.button,
    ...(isEnabled ? styles.buttonShadow : {}),
  });

  /*
  * Sign out the user
  */
  const signOut = () => {
    unsubscribeAllListeners();
    auth.signOut();
  };

  /*
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
        <ScrollView style={styles.scrollView}>
          <View style={styles.info}>
            <View style={styles.aboutUsButtonContainer}>
              <View style={styles.aboutUsButtonShadow} />
              <TouchableOpacity style={styles.aboutUsButton} onPress={() => router.push(`/aboutus`)}>
                <Text style={styles.aboutUsButtonText}> ABOUT US</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.groupInput}>
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
                {loadingUsername ? (
                  <Button disabled={true} size="md" variant="link" action="primary">
                    <ButtonSpinner />
                    <ButtonText style={styles.buttonText}> Please wait...</ButtonText>
                  </Button>
                ) : (
                  <Button
                    size="md"
                    variant="link"
                    action="primary"
                    isDisabled={!isUsernameButtonEnabled}
                    onPress={updateUsername}
                  >
                    <ButtonText style={styles.buttonText}>Edit Username</ButtonText>
                  </Button>
                )}
              </View>
            </View>

            <View style={styles.groupInput}>
              <View style={styles.input}>
                <Input variant='rounded' style={{ marginBottom: 10 }}>
                  <InputField
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                  />
                </Input>
                <Input variant='rounded'>
                  <InputField
                    label="Password"
                    placeholder='Password'
                    value={emailPassword}
                    onChangeText={setEmailPassword}
                    secureTextEntry={true}
                    autoCapitalize='none'
                    textContentType='none'
                    autoCompleteType='off'
                    autoComplete='off' />

                </Input>
              </View>

              <View style={getButtonStyle(isEmailButtonEnabled)}>

                {loadingEmail ? (
                  <Button disabled={true} size="md" variant="link" action="primary">
                    <ButtonSpinner />
                    <ButtonText style={styles.buttonText}> Please wait...</ButtonText>
                  </Button>
                ) : (
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
                )}
              </View>
            </View>

            <View style={styles.groupInput}>
              <View style={styles.input}>
                <Input variant='rounded'>
                  <InputField
                    label="Old Password"
                    placeholder='Old Password'
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry={true}
                    autoCapitalize='none'
                    textContentType="none"
                    autoCompleteType='off'
                    autoComplete='off'
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
                    autoCapitalize='none'
                    textContentType="none"
                    autoCompleteType='off'
                    autoComplete='off'
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
                    autoCapitalize='none'
                    textContentType="none"
                    autoCompleteType='off'
                    autoComplete='off'
                  />
                </Input>
              </View>

              <View style={getButtonStyle(isPasswordButtonEnabled)}>
              {loadingPassword ? (
                  <Button disabled={true} size="md" variant="link" action="primary">
                    <ButtonSpinner />
                    <ButtonText style={styles.buttonText}> Please wait...</ButtonText>
                  </Button>
                ) : (
                <Button
                  size="md"
                  variant="link"
                  action="primary"
                  isDisabled={!isPasswordButtonEnabled}
                  onPress={updatePassword}
                >
                  <ButtonText style={styles.buttonText}>Edit Password</ButtonText>
                </Button>
              )}
              </View>
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

  groupInput: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    margin: 20,
    backgroundColor: COLORS.background_light,
    borderRadius: 10,
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  info: {
    alignItems: 'center',
    marginBottom: Dimensions.get('window').height / 3,
  },

  scrollView: {
    width: '90%',
    alignSelf: 'center',
  },

  button: {
    width: '90%',
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
  },

  aboutUsButtonContainer: {
    position: 'relative',
    width: '50%',
    alignSelf: 'center',
  },

  aboutUsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    width: '100%',
    backgroundColor: COLORS.background_light,
    paddingVertical: 10,
    borderRadius: 15,
    elevation: 5,
  },

  aboutUsButtonShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.blue_dark,
    borderRadius: 15,
    zIndex: -1,
  },

  aboutUsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default Account;
