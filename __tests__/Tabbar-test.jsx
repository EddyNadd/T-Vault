import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TabBar from '../components/TabBar';

describe('TabBar Component', () => {
    // Mock the state
    const mockState = {
        index: 0,
        routes: [
            { key: 'trips', name: 'trips' },
            { key: 'map', name: 'map' },
            { key: 'discover', name: 'discover' },
            { key: 'account', name: 'account' },
        ],
    };

    // Mock the descriptors
    const mockDescriptors = {
        trips: { options: { tabBarLabel: 'Trips' } },
        map: { options: { tabBarLabel: 'Map' } },
        discover: { options: { tabBarLabel: 'Discover' } },
        account: { options: { tabBarLabel: 'Account' } },
    };

    // Mock the navigation object with emit and navigate functions to track calls to the navigator
    const mockNavigation = {
        emit: jest.fn(() => ({
            defaultPrevented: false
        })),
        navigate: jest.fn(),
    };

    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all tab bar items with correct labels', () => {
        const { getByText } = render(
            <TabBar state={mockState} descriptors={mockDescriptors} navigation={mockNavigation} />
        );

        expect(getByText('Trips')).toBeTruthy();
        expect(getByText('Map')).toBeTruthy();
        expect(getByText('Discover')).toBeTruthy();
        expect(getByText('Account')).toBeTruthy();
    });

    it('highlights the focused tab correctly', () => {
        const { getByText } = render(
            <TabBar state={{ ...mockState, index: 2 }} descriptors={mockDescriptors} navigation={mockNavigation} />
        );
        expect(getByText('Discover').props.style.color).toBe('#17C0EB');
        expect(getByText('Trips').props.style.color).toBe('#737373');
    });

    it('calls navigation.navigate on tab press', () => {
        const { getByText } = render(
            <TabBar state={mockState} descriptors={mockDescriptors} navigation={mockNavigation} />
        );

        fireEvent.press(getByText('Map'));

        // Check if the tabPress event was emitted
        expect(mockNavigation.emit).toHaveBeenCalledWith({
            type: 'tabPress',
            target: 'map',
            canPreventDefault: true,
        });

        // Check if the navigation.navigate function was called with the correct arguments
        expect(mockNavigation.navigate).toHaveBeenCalledWith('map', undefined);
    });
});
