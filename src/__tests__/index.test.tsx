import * as React from 'react';
import { Text, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import {
  mockUriGood,
  mockUriBad,
  mockUriSlowGood,
  mockUriSlowBad,
  mockResourceGood,
  mockResourceBad,
} from '../__fixtures__';
import type { ResponsiveImageViewBag } from '../useResponsiveImageView';
import ResponsiveImageView from '..';

const expectedShape = expect.objectContaining<ResponsiveImageViewBag>({
  loading: expect.any(Boolean) as ResponsiveImageViewBag['loading'],
  error: expect.any(String) as ResponsiveImageViewBag['error'],
  getViewProps: expect.any(Function) as ResponsiveImageViewBag['getViewProps'],
  getImageProps: expect.any(
    Function,
  ) as ResponsiveImageViewBag['getImageProps'],
  retry: expect.any(Function) as ResponsiveImageViewBag['retry'],
}) as ResponsiveImageViewBag;

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
      const classRenderMethod = jest.fn((_props) => null);
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
    render(
      <ResponsiveImageView source={{ uri: mockUriGood }}>
        <View>
          <Text>Hello from non-functional children!</Text>
        </View>
      </ResponsiveImageView>,
    );
    expect(screen.getByText(/Hello/i)).toBeTruthy();
  });

  it('renders null if no renderer was provided', () => {
    render(<ResponsiveImageView source={{ uri: mockUriGood }} />);
    expect(screen.queryByText(/.*/)).toBeNull();
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
    new Promise<void>((resolve, reject) => {
      render(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          onLoad={resolve}
          onError={reject}
        />,
      );
    }));

  it('calls provided onError on URI failure', () =>
    new Promise<string>((resolve, reject) => {
      render(
        <ResponsiveImageView
          source={{ uri: mockUriBad }}
          onLoad={reject}
          onError={resolve}
        />,
      );
    }));

  it('calls provided onLoad on imported resource success', () =>
    new Promise<void>((resolve, reject) => {
      render(
        <ResponsiveImageView
          source={mockResourceGood}
          onLoad={resolve}
          onError={reject}
        />,
      );
    }));

  it('calls provided onError on imported resource failure', () =>
    new Promise<string>((resolve, reject) => {
      render(
        <ResponsiveImageView
          source={mockResourceBad}
          onLoad={reject}
          onError={resolve}
        />,
      );
    }));

  it('does not call onLoad on success after unmounting', () =>
    new Promise<void>((resolve, reject) => {
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
    new Promise<void>((resolve, reject) => {
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
