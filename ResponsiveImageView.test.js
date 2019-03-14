import React from 'react';
import { Text, View } from 'react-native';
import { render as rtlRender } from 'react-native-testing-library';
import {
  mockUriGood,
  mockUriBad,
  mockUriSlowGood,
  mockUriSlowBad,
  mockResourceGood,
  mockResourceBad,
} from './test/fixtures';
import ResponsiveImageView from './ResponsiveImageView';

describe('rendering order (component > render > FAC > children > null)', () => {
  describe('renders component if provided', () => {
    it('function', () => {
      const MyRenderComponent = jest.fn(() => null);
      const render = jest.fn(() => null);
      const children = jest.fn(() => null);
      rtlRender(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          component={MyRenderComponent}
          render={render}
        >
          {children}
        </ResponsiveImageView>,
      );
      expect(MyRenderComponent).toHaveBeenCalled();
      expect(render).not.toHaveBeenCalled();
      expect(children).not.toHaveBeenCalled();
    });

    it('class', () => {
      const classRenderMethod = jest.fn(() => null);
      class MyRenderClassComponent extends React.Component {
        render() {
          return classRenderMethod(this.props);
        }
      }

      const render = jest.fn(() => null);
      const children = jest.fn(() => null);
      rtlRender(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          component={MyRenderClassComponent}
          render={render}
        >
          {children}
        </ResponsiveImageView>,
      );
      expect(classRenderMethod).toHaveBeenCalled();
      expect(render).not.toHaveBeenCalled();
      expect(children).not.toHaveBeenCalled();
    });
  });

  it('calls render if no component was provided', () => {
    const render = jest.fn(() => null);
    const children = jest.fn(() => null);
    rtlRender(
      <ResponsiveImageView source={{ uri: mockUriGood }} render={render}>
        {children}
      </ResponsiveImageView>,
    );
    expect(render).toHaveBeenCalled();
    expect(children).not.toHaveBeenCalled();
  });

  it('calls children function if no component or render prop was provided', () => {
    const children = jest.fn(() => null);
    rtlRender(
      <ResponsiveImageView source={{ uri: mockUriGood }}>
        {children}
      </ResponsiveImageView>,
    );
    expect(children).toHaveBeenCalled();
  });

  it('renders children if no component, render prop, or FAC was provided', () => {
    const { getByText } = rtlRender(
      <ResponsiveImageView source={{ uri: mockUriGood }}>
        <View>
          <Text>Hello from non-functional children!</Text>
        </View>
      </ResponsiveImageView>,
    );
    expect(getByText(/Hello/i)).toBeTruthy();
  });

  it('renders null if no renderer was provided', () => {
    const { toJSON } = rtlRender(
      <ResponsiveImageView source={{ uri: mockUriGood }} />,
    );
    expect(toJSON()).toBeNull();
  });
});

describe('completion callbacks', () => {
  it("doesn't throw on success if no onLoad was provided", () => {
    expect(() =>
      rtlRender(<ResponsiveImageView source={{ uri: mockUriGood }} />),
    ).not.toThrow();
  });

  it("doesn't throw on failure if no onError was provided", () => {
    expect(() =>
      rtlRender(<ResponsiveImageView source={{ uri: mockUriBad }} />),
    ).not.toThrow();
  });

  it('calls provided onLoad on URI success', () =>
    new Promise((resolve, reject) => {
      rtlRender(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          onLoad={resolve}
          onError={reject}
        />,
      );
    }));

  it('calls provided onError on URI failure', () =>
    new Promise((resolve, reject) => {
      rtlRender(
        <ResponsiveImageView
          source={{ uri: mockUriBad }}
          onLoad={reject}
          onError={resolve}
        />,
      );
    }));

  it('calls provided onLoad on imported resource success', () =>
    new Promise((resolve, reject) => {
      rtlRender(
        <ResponsiveImageView
          source={mockResourceGood}
          onLoad={resolve}
          onError={reject}
        />,
      );
    }));

  it('calls provided onError on imported resource failure', () =>
    new Promise((resolve, reject) => {
      rtlRender(
        <ResponsiveImageView
          source={mockResourceBad}
          onLoad={reject}
          onError={resolve}
        />,
      );
    }));

  it('does not call onLoad on success after unmounting', () =>
    new Promise((resolve, reject) => {
      const { unmount } = rtlRender(
        <ResponsiveImageView
          source={{ uri: mockUriSlowGood }}
          onLoad={reject}
          onError={reject}
        />,
      );
      unmount();
      setImmediate(resolve);
    }));

  it('does not call onError on failure after unmounting', () =>
    new Promise((resolve, reject) => {
      const { unmount } = rtlRender(
        <ResponsiveImageView
          source={{ uri: mockUriSlowBad }}
          onLoad={reject}
          onError={reject}
        />,
      );
      unmount();
      setImmediate(resolve);
    }));
});
