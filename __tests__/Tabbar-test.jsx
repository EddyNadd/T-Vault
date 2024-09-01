import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TabBar from '../components/TabBar';

describe('TabBar Component', () => {
    const mockState = {
        index: 0,
        routes: [
            { key: 'trips', name: 'trips' },
            { key: 'map', name: 'map' },
            { key: 'discover', name: 'discover' },
            { key: 'account', name: 'account' },
        ],
    };

    const mockDescriptors = {
        trips: { options: { tabBarLabel: 'Trips' } },
        map: { options: { tabBarLabel: 'Map' } },
        discover: { options: { tabBarLabel: 'Discover' } },
        account: { options: { tabBarLabel: 'Account' } },
    };

    const mockNavigation = {
        emit: jest.fn(() => ({
            defaultPrevented: false
        })),
        navigate: jest.fn(),
    };

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

        expect(mockNavigation.emit).toHaveBeenCalledWith({
            type: 'tabPress',
            target: 'map',
            canPreventDefault: true,
        });

        expect(mockNavigation.navigate).toHaveBeenCalledWith('map', undefined);
    });
});
