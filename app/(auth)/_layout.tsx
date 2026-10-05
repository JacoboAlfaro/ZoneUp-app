import { Stack } from 'expo-router'

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerTitleStyle: { fontWeight: "600" } }}>
            <Stack.Screen name="login" options={{ title: "Login", headerShown: false }} />
            <Stack.Screen name="register" options={{ title: "Register", headerShown: false }} />
        </Stack>
    )
}
