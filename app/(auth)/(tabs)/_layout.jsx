import React from 'react'
import { Tabs } from 'expo-router'
import TabBar from '../../../components/TabBar'

const _layout = () => {
  return (
    <Tabs
        screenOptions={{headerShown: false}}
        tabBar={props => <TabBar {...props} />}
    >
        <Tabs.Screen 
            name="trips"
            options={{title: 'MY TRIPS'}}
        />
        <Tabs.Screen 
            name="discover"
            options={{title: 'DISCOVER'}}
        />
        <Tabs.Screen 
            name="map"
            options={{title: 'MAP'}}
        />
        <Tabs.Screen 
            name="account"
            options={{title: 'ACCOUNT'}}
        />
    </Tabs>
  )
}

export default _layout