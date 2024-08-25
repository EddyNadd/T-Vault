import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import Header from '../../../components/Header';
import { auth } from '../../../firebase.jsx';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';

const Account = () => {
  const [username, setUsername] = useState(auth.currentUser.displayName);
  const [email, setEmail] = useState(auth.currentUser.email);
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
          >
            <ButtonText>Edit Password</ButtonText>
          </Button>
        </SafeAreaView>
      </SafeAreaView>
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
});

export default Account;
