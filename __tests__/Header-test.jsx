import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import Header from '../components/Header';

describe('Header Component', () => {
  it('renders correctly with title and logo', () => {
    const logoSource = { uri: '../assets/icon.png' };
    const title = 'Test Title';

    const { getByText, getByTestId } = render(
      <Header logoSource={logoSource} title={title} />
    );

    expect(getByText(title)).toBeTruthy();
    const logo = getByTestId('header-logo');
    expect(logo.props.source).toEqual(logoSource);
  });

  it('renders the ButtonComponent if provided', () => {
    const MockButton = () => <Text>Mock Button</Text>;
    const logoSource = { uri: '../assets/icon.png' };
    const title = 'Test Title';

    const { getByText } = render(
      <Header logoSource={logoSource} title={title} ButtonComponent={MockButton} />
    );

    expect(getByText('Mock Button')).toBeTruthy();
  });

  it('does not render ButtonComponent if not provided', () => {
    const logoSource = { uri: '../assets/icon.png' };
    const title = 'No Button';

    const { queryByText } = render(
      <Header logoSource={logoSource} title={title} />
    );

    expect(queryByText('Mock Button')).toBeNull();
  });
});
