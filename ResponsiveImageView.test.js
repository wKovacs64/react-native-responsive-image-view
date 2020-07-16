import React from 'react';
import { Text, View } from 'react-native';
import { render } from 'react-native-testing-library';
import {
  mockUriGood,
  mockUriBad,
  mockUriSlowGood,
  mockUriSlowBad,
  mockResourceGood,
  mockResourceBad,
} from './test/fixtures';
import ResponsiveImageView from './ResponsiveImageView';

const expectedShape = expect.objectContaining({
  loading: expect.any(Boolean),
  error: expect.any(String),
  getViewProps: expect.any(Function),
  getImageProps: expect.any(Function),
});

describe('rendering order (component > render > FAC > children > null)', () => {
  describe('renders component if provided', () => {
    it('function', () => {
      const MyRenderComponent = jest.fn(() => null);
      const renderProp = jest.fn(() => null);
      const children = jest.fn(() => null);
      render(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          component={MyRenderComponent}
          render={renderProp}
        >
          {children}
        </ResponsiveImageView>,
      );
      expect(MyRenderComponent).toHaveBeenCalledWith(expectedShape);
      expect(renderProp).not.toHaveBeenCalled();
      expect(children).not.toHaveBeenCalled();
    });

    it('class', () => {
      const classRenderMethod = jest.fn(() => null);
      class MyRenderClassComponent extends React.Component {
        render() {
          return classRenderMethod(this.props);
        }
      }

      const renderProp = jest.fn(() => null);
      const children = jest.fn(() => null);
      render(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          component={MyRenderClassComponent}
          render={renderProp}
        >
          {children}
        </ResponsiveImageView>,
      );
      expect(classRenderMethod).toHaveBeenCalledWith(expectedShape);
      expect(renderProp).not.toHaveBeenCalled();
      expect(children).not.toHaveBeenCalled();
    });
  });

  it('calls render if no component was provided', () => {
    const renderProp = jest.fn(() => null);
    const children = jest.fn(() => null);
    render(
      <ResponsiveImageView source={{ uri: mockUriGood }} render={renderProp}>
        {children}
      </ResponsiveImageView>,
    );
    expect(renderProp).toHaveBeenCalledWith(expectedShape);
    expect(children).not.toHaveBeenCalled();
  });

  it('calls children function if no component or render prop was provided', () => {
    const children = jest.fn(() => null);
    render(
      <ResponsiveImageView source={{ uri: mockUriGood }}>
        {children}
      </ResponsiveImageView>,
    );
    expect(children).toHaveBeenCalledWith(expectedShape);
  });

  it('renders children if no component, render prop, or FAC was provided', () => {
    const { getByText } = render(
      <ResponsiveImageView source={{ uri: mockUriGood }}>
        <View>
          <Text>Hello from non-functional children!</Text>
        </View>
      </ResponsiveImageView>,
    );
    expect(getByText(/Hello/i)).toBeTruthy();
  });

  it('renders null if no renderer was provided', () => {
    const { queryByText } = render(
      <ResponsiveImageView source={{ uri: mockUriGood }} />,
    );
    expect(queryByText(/.*/)).toBeNull();
  });
});

describe('completion callbacks', () => {
  it("doesn't throw on success if no onLoad was provided", () => {
    expect(() =>
      render(<ResponsiveImageView source={{ uri: mockUriGood }} />),
    ).not.toThrow();
  });

  it("doesn't throw on failure if no onError was provided", () => {
    expect(() =>
      render(<ResponsiveImageView source={{ uri: mockUriBad }} />),
    ).not.toThrow();
  });

  it('calls provided onLoad on URI success', () =>
    new Promise((resolve, reject) => {
      render(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          onLoad={resolve}
          onError={reject}
        />,
      );
    }));

  it('calls provided onError on URI failure', () =>
    new Promise((resolve, reject) => {
      render(
        <ResponsiveImageView
          source={{ uri: mockUriBad }}
          onLoad={reject}
          onError={resolve}
        />,
      );
    }));

  it('calls provided onLoad on imported resource success', () =>
    new Promise((resolve, reject) => {
      render(
        <ResponsiveImageView
          source={mockResourceGood}
          onLoad={resolve}
          onError={reject}
        />,
      );
    }));

  it('calls provided onError on imported resource failure', () =>
    new Promise((resolve, reject) => {
      render(
        <ResponsiveImageView
          source={mockResourceBad}
          onLoad={reject}
          onError={resolve}
        />,
      );
    }));

  it('does not call onLoad on success after unmounting', () =>
    new Promise((resolve, reject) => {
      const { unmount } = render(
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
      const { unmount } = render(
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
