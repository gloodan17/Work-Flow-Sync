import React from 'react'
import { Stack } from 'expo-router'

export default function HomeLayout() {
    return (
        <Stack>
            <Stack.Screen name='DashboardScreen' options={{ headerTitle: 'Dashboard' }} />
            <Stack.Screen name="ClockInOutScreen" options={{ headerTitle: "Clock in/out", headerBackVisible: false }} />
        </Stack>
    )
}
