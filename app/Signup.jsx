import { StyleSheet, ActivityIndicator, TextInput, Button, KeyboardAvoidingView, Text } from "react-native";
import { auth, db } from "../firebase.jsx";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDocs, setDoc, collection, query, where, documentId } from "firebase/firestore"; 
import { useState } from "react";
import { router } from "expo-router";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const signUp = async () => {
        setLoading(true);
        try {
            requestedUser = await getDocs(query(collection(db, "Users"), where(documentId(), "==", username)));
            if (!requestedUser.empty) {
                alert("Username already exists!");
                return;
            }
            await createUserWithEmailAndPassword(auth, email, password);
            updateProfile(auth.currentUser, {displayName: username})
            await setDoc(doc(db, "Users", username), {
                user: username
            });
            alert("Signed up successfully!");
        } catch (error) {
            console.error("Failed to sign up:", error);
        } finally {
            setLoading(false);
        }
    }

    const signIn = async () => {
        router.replace('/');
    }

    return (
        <KeyboardAvoidingView style={styles.main} behavior="padding">
            <Text>Sign Up</Text>
            <TextInput placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect="false" />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email"/>
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry/>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <Button title="Sign Up" onPress={signUp}/>
                    <Button title="Sign In" onPress={signIn}/>
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
