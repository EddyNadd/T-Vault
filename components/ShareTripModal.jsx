import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, Text, useWindowDimensions } from 'react-native';
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from '@/components/ui/input';
import { RadioGroup, Radio, RadioIndicator, RadioLabel } from '@/components/ui/radio';
import { Switch } from '@/components/ui/switch';
import { CodeField, useClearByFocusCell, Cursor } from 'react-native-confirmation-code-field';
import { getDoc, doc, setDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import COLORS from '@/styles/COLORS';
import * as Clipboard from 'expo-clipboard';
import { useFirestoreListeners } from '@/components/FirestoreListenerContext';
import { FormControl, FormControlErrorText, FormControlError } from '@/components/ui/form-control';

export default function ShareTripModal({
    isOpen,
    tripCode,
    onConfirm,
    onCancel
}) {
    const [values, setValues] = useState(false)
    const [username, setUsername] = useState("");
    const [users, setUsers] = useState([]);
    const [shared, setShared] = useState(false);
    const [copyAction, setCopyAction] = useState("primary");
    const [copyVariant, setCopyVariant] = useState("outline");
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState("");
    const { height } = useWindowDimensions();
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        tripCode
    });
    const { listenersRef } = useFirestoreListeners();
    const currentListeners = useRef([]);

    const scrollViewMaxHeight = height * 0.3;

    useEffect(() => {
        let unsubscribe;

        const fetchUsers = async (uids) => {
            if (uids.length === 0) return {};
            let users = {};
            for (const uid of uids) {
                const docRef = doc(db, 'UID', uid);
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                    users[uid] = 'Unknown';
                } else {
                    users[uid] = docSnap.data().username;
                }
            }
            return users;
        };

        if (!isOpen) {
            setUsername("");
            setUsers([]);
            setShared(false);
            setCopyAction("primary");
            setCopyVariant("outline");
            setError(false);
            setErrorText("");
        } else {
            const tripRef = doc(db, "Trips", tripCode.toLowerCase());

            unsubscribe = onSnapshot(tripRef, async (snapshot) => {
                if (snapshot.exists()) {
                    let users = [];
                    if (snapshot.data().canWrite) {
                        users = snapshot.data().canWrite.map(uid => ({
                            id: Math.random().toString(36),
                            username: "",
                            permission: true,
                            uid: uid,
                            pending: false
                        }));
                    }
                    if (snapshot.data().canRead) {
                        users = [...users, ...snapshot.data().canRead.map(uid => ({
                            id: Math.random().toString(36),
                            username: "",
                            permission: false,
                            uid: uid,
                            pending: false
                        }))];
                    }
                    if (snapshot.data().invitWrite) {
                        users = [...users, ...snapshot.data().invitWrite.map(uid => ({
                            id: Math.random().toString(36),
                            username: "",
                            permission: true,
                            uid: uid,
                            pending: true
                        }))];
                    }
                    if (snapshot.data().invitRead) {
                        users = [...users, ...snapshot.data().invitRead.map(uid => ({
                            id: Math.random().toString(36),
                            username: "",
                            permission: false,
                            uid: uid,
                            pending: true
                        }))];
                    }
                    for (const user of users) {
                        const userDoc = await getDoc(doc(db, "UID", user.uid));
                        user.username = userDoc.exists() ? userDoc.data().username : "Unknown";
                    }

                    setUsers(users);
                    setShared(snapshot.data().shared);
                }
            }, (error) => {
                console.error("Error retrieving trip: ", error);
            });
            listenersRef.current.push(unsubscribe);
            currentListeners.current.push(unsubscribe);
        }
        return () => {
            currentListeners.current.forEach((unsubscribe) => unsubscribe());
            currentListeners.current = [];
        };
    }, [isOpen, tripCode]);

    const copyCode = async () => {
        setCopyAction("positive");
        setCopyVariant("solid");
        await Clipboard.setStringAsync(tripCode.toUpperCase());
        setTimeout(() => {
            setCopyAction("primary");
            setCopyVariant("outline");
        }, 2000);
    };

    const handleShareToggle = () => {
        setShared(!shared);
        const tripRef = doc(db, "Trips", tripCode.toLowerCase());
        setDoc(tripRef, {
            shared: !shared,
            canRead: [],
        }, { merge: true });
    };

    const handleAddUser = async () => {
        try {
            if (username === "") return;
            if (users.find(user => user.username === username)) {
                setError(true);
                setErrorText("User already added");
                return;
            }
            if (username === auth.currentUser.displayName) {
                setError(true);
                setErrorText("You can't add yourself");
                return;
            }
            const userDoc = await getDoc(doc(db, "Users", username));
            if (!userDoc.exists()) {
                setError(true);
                setErrorText("User not found");
                return;
            }
            const uid = userDoc.data().uid;
            const id = Math.random().toString(36);
            const user = { id, username, permission: values, uid, pending: true };
            const tripRef = doc(db, "Trips", tripCode.toLowerCase());
            if (values === true) {
                setDoc(tripRef, {
                    invitWrite: arrayUnion(uid)
                }, { merge: true });
            } else {
                setDoc(tripRef, {
                    invitRead: arrayUnion(uid)
                }, { merge: true });
            }
            setError(false);
            setErrorText("");
        } catch (error) {
            setError(true);
            setErrorText("User not found");
        }
    };

    const handleRemoveUser = async (uid, id) => {
        try {
            const user = users.find(user => user.id === id);
            const tripRef = doc(db, "Trips", tripCode.toLowerCase());

            if (user.permission === true && user.pending === false) {
                await setDoc(tripRef, {
                    canWrite: arrayRemove(uid)
                }, { merge: true });
            } else if (user.permission === false && user.pending === false) {
                await setDoc(tripRef, {
                    canRead: arrayRemove(uid)
                }, { merge: true });
            } else if (user.permission === true && user.pending === true) {
                await setDoc(tripRef, {
                    invitWrite: arrayRemove(uid)
                }, { merge: true });
            } else if (user.permission === false && user.pending === true) {
                await setDoc(tripRef, {
                    invitRead: arrayRemove(uid)
                }, { merge: true });
            }
        } catch (error) {
            console.error("Error removing user: ", error);
        }
    };

    const handlePermissionChange = async (id, permission) => {
        const user = users.find(user => user.id === id);
        if (permission === true && user.pending === false) {
            await setDoc(doc(db, "Trips", tripCode.toLowerCase()), {
                canRead: arrayRemove(user.uid),
                canWrite: arrayUnion(user.uid)
            }, { merge: true });
        } else if (permission === false && user.pending === false) {
            await setDoc(doc(db, "Trips", tripCode.toLowerCase()), {
                canWrite: arrayRemove(user.uid),
                canRead: arrayUnion(user.uid)
            }, { merge: true });
        } else if (permission === true && user.pending === true) {
            await setDoc(doc(db, "Trips", tripCode.toLowerCase()), {
                invitRead: arrayRemove(user.uid),
                invitWrite: arrayUnion(user.uid)
            }, { merge: true });
        } else if (permission === false && user.pending === true) {
            await setDoc(doc(db, "Trips", tripCode.toLowerCase()), {
                invitWrite: arrayRemove(user.uid),
                invitRead: arrayUnion(user.uid)
            }, { merge: true });
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setUsername("");
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onCancel}>
            <ModalBackdrop />
            <ModalContent>
                <View style={{ marginBottom: 20, display: 'flex', flexDirection: "row", alignItems: 'center' }}>

                    <View style={{ flex: 1, marginRight: 20 }}>
                        <FormControl isInvalid={error}>
                            <Input>
                                <InputField textContentType="oneTimeCode" placeholder="Username" onChangeText={setUsername} value={username} autoCapitalize="none" autoCorrect={false} spellCheck="false"></InputField>
                            </Input>
                            <FormControlError>
                                <FormControlErrorText>{errorText}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>
                    </View>

                    <View>
                        <RadioGroup value={values} onChange={setValues}>
                            <Radio size="lg" value={false}>
                                <RadioIndicator style={values === false ? styles.checked : styles.unchecked}>
                                </RadioIndicator>
                                <RadioLabel>Read</RadioLabel>
                            </Radio>
                            <Radio size="lg" value={true}>
                                <RadioIndicator style={values === true ? styles.checked : styles.unchecked}>
                                </RadioIndicator>
                                <RadioLabel>Edit</RadioLabel>
                            </Radio>
                        </RadioGroup>
                    </View>
                    <View>
                        <Button onPress={handleAddUser} size="md" variant="outline" action="primary" style={{ marginLeft: 20 }}>
                            <ButtonText>Add</ButtonText>
                        </Button>
                    </View>
                </View>
                <ScrollView style={[styles.scrollView, { maxHeight: scrollViewMaxHeight }]}>
                    {users.map((user) => (
                        <View key={user.id} style={styles.userContainer}>
                            <Text style={{ flex: 1, color: "white" }}>{user.username} - {user.pending ? "pending" : "access"}</Text>
                            <RadioGroup
                                value={user.permission}
                                onChange={(value) => handlePermissionChange(user.id, value)}
                            >
                                <Radio size="lg" value={false}>
                                    <RadioIndicator style={user.permission === false ? styles.checked : styles.unchecked} />
                                    <RadioLabel>Read</RadioLabel>
                                </Radio>
                                <Radio size="lg" value={true}>
                                    <RadioIndicator style={user.permission === true ? styles.checked : styles.unchecked} />
                                    <RadioLabel>Edit</RadioLabel>
                                </Radio>
                            </RadioGroup>
                            <Button onPress={() => handleRemoveUser(user.uid, user.id)} size="sm" variant="outline" style={{ marginLeft: 20 }}>
                                <ButtonText>Remove</ButtonText>
                            </Button>
                        </View>
                    ))}
                </ScrollView>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-around", marginBottom: 20 }}>
                    <Switch value={shared} onValueChange={handleShareToggle} />
                    <Text style={{ color: "white" }}>⚠️ Enable read-only with code</Text>
                </View>
                {shared && (
                    <View>
                        <CodeField
                            value={tripCode.toUpperCase()}
                            cellCount={6} renderCell={({ index, symbol, isFocused }) => (
                                <Text
                                    key={index}
                                    style={[styles.cell, isFocused && styles.focusCell, { color: "white" }]}
                                    onLayout={getCellOnLayoutHandler(index)}>
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            )}></CodeField>
                        <Button onPress={copyCode} size="md" variant={copyVariant} action={copyAction} style={{ borderRadius: 100, marginBottom: 20 }}>
                            <ButtonText>Copy</ButtonText>
                        </Button>
                    </View>
                )}
                <View style={{ marginBottom: 20 }}>
                    <Button onPress={onConfirm} size="md" variant="outline" action="primary">
                        <ButtonText>Done</ButtonText>
                    </Button>
                </View>
            </ModalContent>
        </Modal>
    );
}

const styles = {
    circleIcon: {
        width: 10,
        height: 10,
        backgroundColor: '#fff',
        alignSelf: 'center',
    },
    checked: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 5,
    },
    unchecked: {
        backgroundColor: COLORS.background_dark,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#000',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 10,
    },
    scrollView: {
        marginBottom: 10
    },
    root: { flex: 1, padding: 20 },
    title: { textAlign: 'center', fontSize: 30 },
    cell: {
        width: 40,
        height: 40,
        lineHeight: 38,
        fontSize: 24,
        borderWidth: 2,
        borderColor: '#9e9e9e',
        textAlign: 'center',
        borderRadius: 10,
        marginBottom: 5
    },
    focusCell: {
        borderColor: 'white',
    },
    text: {
        color: 'white',
        fontSize: 40,
        font: 'Anton',
        fontWeight: 'bold',
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
};