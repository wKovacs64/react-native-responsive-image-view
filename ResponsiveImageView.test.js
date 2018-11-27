import React from 'react';
import { Text, View } from 'react-native';
import { render as rtlRender } from 'react-native-testing-library';
import ResponsiveImageView from './ResponsiveImageView';

// Test data
const mockUriGood = 'mockUriGood';
const mockUriBad = 'mockUriBad';
const mockUriSlowGood = 'mockUriSlowGood';
const mockUriSlowBad = 'mockUriSlowBad';
const mockResourceGood = 1000;
const mockResourceBad = 9999;
const mockWidth = 800;
const mockHeight = 600;
const aspectRatio = 16 / 9;
const consumerViewProps = {
  hitSlop: {
    top: 10,
    bottom: 10,
    left: 0,
    right: 0,
  },
  style: {
    padding: 20,
  },
};
const consumerImageProps = {
  onLayout: jest.fn().mockName('Image#onLayout'),
  style: {
    height: '50%',
    width: '50%',
  },
};

// Mocks
jest.mock('Image', () => ({
  getSize(uri, onLoad, onError) {
    switch (uri) {
      case mockUriGood:
        onLoad(mockWidth, mockHeight);
        break;
      case mockUriBad:
        onError(new Error(uri));
        break;
      case mockUriSlowGood:
        setImmediate(onLoad);
        break;
      case mockUriSlowBad:
        setImmediate(() => {
          onError(uri);
        });
        break;
      default:
        throw new Error(`Unexpected URI value in test: ${uri}`);
    }
  },
}));
jest.mock('react-native/Libraries/Image/resolveAssetSource', () => res => {
  if (res === mockResourceGood) {
    return { width: mockWidth, height: mockHeight };
  }
  return null;
});

// Tests
describe('rendering order (component > render > FAC > children > null)', () => {
  it('renders component if provided', () => {
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

describe('component injection', () => {
  it('renders the component with expected parameters on success', () => {
    const MyRenderComponent = jest.fn(() => null);
    rtlRender(
      <ResponsiveImageView
        source={{ uri: mockUriGood }}
        component={MyRenderComponent}
      />,
    );
    expect(MyRenderComponent.mock.calls).toMatchSnapshot();
  });

  it('renders the component with expected parameters on failure', () => {
    const MyRenderComponent = jest.fn(() => null);
    rtlRender(
      <ResponsiveImageView
        source={{ uri: mockUriBad }}
        component={MyRenderComponent}
      />,
    );
    expect(MyRenderComponent.mock.calls).toMatchSnapshot();
  });

  it('renders class components', () => {
    const classRenderMethod = jest.fn(() => null);
    // eslint-disable-next-line react/prefer-stateless-function
    class MyRenderClassComponent extends React.Component {
      render() {
        return classRenderMethod(this.props);
      }
    }
    rtlRender(
      <ResponsiveImageView
        source={{ uri: mockUriGood }}
        component={MyRenderClassComponent}
      />,
    );
    expect(classRenderMethod.mock.calls).toMatchSnapshot();
  });
});

describe('render prop', () => {
  it('calls render with expected parameters on success', () => {
    const render = jest.fn(() => null);
    rtlRender(
      <ResponsiveImageView source={{ uri: mockUriGood }} render={render} />,
    );
    expect(render.mock.calls).toMatchSnapshot();
  });

  it('calls render with expected parameters on failure', () => {
    const render = jest.fn(() => null);
    rtlRender(
      <ResponsiveImageView source={{ uri: mockUriBad }} render={render} />,
    );
    expect(render.mock.calls).toMatchSnapshot();
  });
});

describe('function-as-children', () => {
  it('calls children with expected parameters on success', () => {
    const children = jest.fn(() => null);
    rtlRender(
      <ResponsiveImageView source={{ uri: mockUriGood }}>
        {children}
      </ResponsiveImageView>,
    );
    expect(children.mock.calls).toMatchSnapshot();
  });

  it('calls children with expected parameters on failure', () => {
    const children = jest.fn(() => null);
    rtlRender(
      <ResponsiveImageView source={{ uri: mockUriBad }}>
        {children}
      </ResponsiveImageView>,
    );
    expect(children.mock.calls).toMatchSnapshot();
  });
});

describe('getViewProps', () => {
  it('includes controlled aspectRatio', () => {
    expect.assertions(1);
    rtlRender(
      <ResponsiveImageView
        aspectRatio={aspectRatio}
        source={{ uri: mockUriGood }}
        render={({ loading, getViewProps }) => {
          if (!loading) {
            expect(getViewProps()).toMatchSnapshot();
          }
          return null;
        }}
      />,
    );
  });

  it('includes calculated aspectRatio if not provided', () => {
    expect.assertions(1);
    rtlRender(
      <ResponsiveImageView
        source={{ uri: mockUriGood }}
        render={({ loading, getViewProps }) => {
          if (!loading) {
            expect(getViewProps()).toMatchSnapshot();
          }
          return null;
        }}
      />,
    );
  });

  it('composes consumer props with own props', () => {
    expect.assertions(1);
    rtlRender(
      <ResponsiveImageView
        source={{ uri: mockUriGood }}
        render={({ loading, getViewProps }) => {
          if (!loading) {
            expect(getViewProps({ ...consumerViewProps })).toMatchSnapshot();
          }
          return null;
        }}
      />,
    );
  });
});

describe('getImageProps', () => {
  it('sets height and width to 100%', () => {
    expect.assertions(1);
    rtlRender(
      <ResponsiveImageView
        source={{ uri: mockUriGood }}
        render={({ loading, getImageProps }) => {
          if (!loading) {
            expect(getImageProps()).toMatchSnapshot();
          }
          return null;
        }}
      />,
    );
  });

  it('composes consumer props with own props', () => {
    expect.assertions(1);
    rtlRender(
      <ResponsiveImageView
        source={{ uri: mockUriGood }}
        render={({ loading, getImageProps }) => {
          if (!loading) {
            expect(getImageProps({ ...consumerImageProps })).toMatchSnapshot();
          }
          return null;
        }}
      />,
    );
  });
});

describe('completion callbacks', () => {
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
