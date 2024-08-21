import { StyleSheet, ActivityIndicator, TextInput, Button, KeyboardAvoidingView, Text } from "react-native";
import { auth } from "../firebase.jsx";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { router } from "expo-router";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const signUp = async () => {
        router.replace('/Signup');
    }

    const signIn = async () => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Signed in successfully!");
        } catch (error) {
            console.error("Failed to sign in:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView style={styles.main} behavior="padding">
            <Text>Sign In</Text>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email"/>
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry/>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <Button title="Sign In" onPress={signIn}/>
                    <Button title="Sign Up" onPress={signUp}/>
                </>
            )}
        </KeyboardAvoidingView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 24,
    },
    main: {
        flex: 1,
        justifyContent: "center",
        maxWidth: 960,
        marginHorizontal: "auto",
    },
    title: {
        fontSize: 64,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 36,
        color: "#38434D",
    }
});
