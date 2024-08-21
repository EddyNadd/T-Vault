import { View, Text, Button, TextInput } from 'react-native'
import { auth } from '../../firebase.jsx'
import React from 'react'

export default function Home() {
    return (
        <View>
            <Text>Bienvenue !</Text>
            <Button title="Sign Out" onPress={() => auth.signOut()} />
        </View>
    )
}