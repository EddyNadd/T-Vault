import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { auth } from '../firebase.jsx';
import Signin from '../app/index.jsx';
import { signInWithEmailAndPassword } from 'firebase/auth';

jest.mock('firebase/auth', () => {
    return {
        signInWithEmailAndPassword: jest.fn(),
        getReactNativePersistence: jest.fn(),
        initializeAuth: jest.fn(() => ({
            onAuthStateChanged: jest.fn((callback) => callback()),
        })),
    };
});

describe('Signin Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByPlaceholderText, getByText } = render(<Signin />);
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByText("Don't have an account?")).toBeTruthy();
    });

    it('should handle sign-in with valid credentials', async () => {
        signInWithEmailAndPassword.mockResolvedValueOnce({ user: {} });

        const { getByPlaceholderText, getByText } = render(<Signin />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.test');
        fireEvent.changeText(getByPlaceholderText('Password'), 'testtest');
        fireEvent.press(getByText('Sign In'));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@test.test', 'testtest');
        });
    });

    it('should display error message on failed sign-in', async () => {
        signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Auth Error'));

        const { getByPlaceholderText, getByText, findByText } = render(<Signin />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
        fireEvent.press(getByText('Sign In'));

        const errorMessage = await findByText('The email or password is incorrect');
        expect(errorMessage).toBeTruthy();
    });
});
