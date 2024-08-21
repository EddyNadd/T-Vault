import { View, Text, Button } from 'react-native'
import { auth } from '../../../firebase.jsx'
import React from 'react'

export default function Account() {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Button title="Sign Out" onPress={() => auth.signOut()} />
        </View>
    )
}