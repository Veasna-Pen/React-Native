import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage'

export type RegisterProps = {
    username: string;
    password: string;
    email: string;
};

type AuthUser = {
    username: string;
    email: string;
    token: string;
};

type LoginProps = {
    email: string;
    password: string;
}

type AuthState = {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean,
    register: (args: RegisterProps) => Promise<{ success: boolean; error?: string }>;
    login: (args: LoginProps) => Promise<{ success: boolean; error?: string }>;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: false,

    register: async ({ username, password, email }: RegisterProps) => {
        try {
            set({ isLoading: true })
            const res = await fetch(`https://react-native-qdcu.onrender.com/api/auth/register`, {

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
    },

    login: async ({ email, password }: LoginProps) => {
        set({ isLoading: true })
        try {

            const res = await fetch(`https://react-native-qdcu.onrender.com/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
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
    },

    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userJson = await AsyncStorage.getItem('user');
            const user: AuthUser | null = userJson ? JSON.parse(userJson) : null;

            set({ token, user })
        } catch (error) {
            console.log('Auth check failed', error);
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('user')
        set({ token: null, user: null })
    }
}));
