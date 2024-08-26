import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Header from '../../../components/Header';
import { getAuth, updateProfile, updateEmail as updateFirebaseEmail, updatePassword as updateFirebasePassword, EmailAuthProvider, reauthenticateWithCredential, signInWithEmailAndPassword } from "firebase/auth";
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
      await updateProfile(auth.currentUser, {
        displayName: username,
      });

      await deleteDoc(doc(db, 'Users', oldUsername));

      await setDoc(doc(db, 'Users', username), {
        uid: auth.currentUser.uid,
      });

      await setDoc(doc(db, 'UID', auth.currentUser.uid), {
        username: username
      });

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

  const handleUpdate = () => {
    if (isUsernameButtonEnabled) {
      updateUsername();
    }
    if (isEmailButtonEnabled) {
      updateEmail();
    }
    if (isPasswordButtonEnabled) {
      updatePassword();
    }
  };

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
        <SafeAreaView style={styles.info}>
          <SafeAreaView style={styles.input}>
            <Input>
              <InputField
                label="UserName"
                value={username}
                onChangeText={setUsername}
              />
            </Input>
          </SafeAreaView>

          <SafeAreaView style={styles.button}>
            <Button
              size="md"
              variant="outline"
              action="primary"
              isDisabled={!isUsernameButtonEnabled}
              onPress={updateUsername}
            >
              <ButtonText>Edit Username</ButtonText>
            </Button>
          </SafeAreaView>

          <SafeAreaView style={styles.input}>
            <Input>
              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
              />
            </Input>
          </SafeAreaView>

          <SafeAreaView style={styles.button}>
            <Button
              size="md"
              variant="outline"
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
              <ButtonText>Edit Email</ButtonText>
            </Button>
          </SafeAreaView>

          <SafeAreaView style={styles.input}>
            <Input>
              <InputField
                label="Old Password"
                placeholder='Old Password'
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={true}
              />
            </Input>
          </SafeAreaView>

          <SafeAreaView style={styles.input}>
            <Input>
              <InputField
                label="New Password"
                placeholder='New Password'
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={true}
              />
            </Input>
          </SafeAreaView>

          <SafeAreaView style={styles.input}>
            <Input>
              <InputField
                label="Confirm Password"
                placeholder='Confirm Password'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
              />
            </Input>
          </SafeAreaView>

          <SafeAreaView style={styles.button}>
            <Button
              size="md"
              variant="outline"
              action="primary"
              isDisabled={!isPasswordButtonEnabled}
              onPress={updatePassword}
            >
              <ButtonText>Edit Password</ButtonText>
            </Button>
          </SafeAreaView>
        </SafeAreaView>
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
    marginTop: 20,
    marginLeft: 10,
    width: '100%',
    alignItems: 'left',
  },
  button: {
    width: '95%',
    borderRadius: 25,
    marginBottom: 50,
  },
  input: {
    width: '95%',
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 5,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
});

export default Account;
