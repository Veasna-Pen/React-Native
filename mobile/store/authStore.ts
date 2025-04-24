import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage'

export type RegisterProps = {
    username: string;
    password: string;
    email: string;
};

type AuthState = {
    user: string | null;
    token: string | null;
    isLoading: boolean,
    register: (args: RegisterProps) => Promise<{ success: boolean; error?: string }>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: false,

    register: async ({ username, password, email }: { username: string, password: string, email: string }) => {
        try {
            set({ isLoading: true })
            // const res = await fetch(`${process.env.BASE_URL}/auth/register`, {
            const res = await fetch(`https://r63dt738-3000.asse.devtunnels.ms/api/auth/register`, {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    email
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Something went wrong')

            await AsyncStorage.setItem('user', JSON.stringify(data.user))
            await AsyncStorage.setItem('token', data.token)

            set({ token: data.token, user: data.user, isLoading: false })

            return { success: true }

        } catch (error: any) {
            set({ isLoading: false })
            return { success: false, error: error.message }
        }
    }
}));
