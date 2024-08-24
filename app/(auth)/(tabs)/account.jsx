import React from 'react';
import { TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import Header from '../../../components/Header';
import { auth } from '../../../firebase.jsx'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';


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
      <SafeAreaView style={styles.info}>

        <SafeAreaView style={styles.input} >
          <Input>
            <InputField label="UserName" value={auth.currentUser.displayName} />
          </Input>
        </SafeAreaView>

        <SafeAreaView style={styles.button}>
          <Button size="md" variant="outline" action="primary">
            <ButtonText>Edit Username</ButtonText>
          </Button>
        </SafeAreaView>

        <SafeAreaView style={styles.input}>
          <Input>
            <InputField label="Email" value={auth.currentUser.email} />
          </Input>
        </SafeAreaView>

        <SafeAreaView style={styles.button}>
          <Button size="md" variant="outline" action="primary">
            <ButtonText>Edit Email</ButtonText>
          </Button>
        </SafeAreaView>

        <SafeAreaView style={styles.input}>
          <Input>
            <InputField label="Password" value="Old Password" />
          </Input>
        </SafeAreaView>

        <SafeAreaView style={styles.input}>
          <Input>
            <InputField label="Password" value="New Password" />
          </Input>
        </SafeAreaView>

        <SafeAreaView style={styles.input}>
          <Input>
            <InputField label="Password" value="Confirm Password" />
          </Input>
        </SafeAreaView>

        <SafeAreaView style={styles.button}>
          <Button size="md" variant="outline" action="primary">
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

  color: {
    width: '100%',
    height: 150,
    borderRadius: 25,
    marginBottom: 15,
  },

  info: {
    marginTop: 20,
    marginLeft: 10,
    width: '100%',
    alignItems: 'left',
  },

  edit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
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

  buttonEdit: {
    width: '15%',
    borderRadius: 25,
  },

});

export default account;