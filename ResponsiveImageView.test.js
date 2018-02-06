import React from 'react';
import { Text, View } from 'react-native';
import { shallow } from 'enzyme';
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
        throw new Error(`Unexepcted URI value in test: ${uri}`);
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
  it('should render component if provided', () => {
    const MyRenderComponent = props => <View {...props} />;
    const render = jest.fn();
    const children = jest.fn();
    const wrapper = shallow(
      <ResponsiveImageView
        source={{ uri: mockUriGood }}
        component={MyRenderComponent}
        render={render}
      >
        {children}
      </ResponsiveImageView>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(render.mock.calls).toMatchSnapshot('render');
    expect(children.mock.calls).toMatchSnapshot('children');
  });

  it('should call render if no component was provided', () => {
    const render = jest.fn();
    const children = jest.fn();
    shallow(
      <ResponsiveImageView source={{ uri: mockUriGood }} render={render}>
        {children}
      </ResponsiveImageView>,
    );
    expect(render.mock.calls).toMatchSnapshot('render');
    expect(children.mock.calls).toMatchSnapshot('children');
  });

  it('should call children function if no component or render prop was provided', () => {
    const children = jest.fn();
    shallow(
      <ResponsiveImageView source={{ uri: mockUriGood }}>
        {children}
      </ResponsiveImageView>,
    );
    expect(children.mock.calls).toMatchSnapshot('children');
  });

  it('should render children if no component, render prop, or FAC was provided', () => {
    expect(
      shallow(
        <ResponsiveImageView source={{ uri: mockUriGood }}>
          <View>
            <Text>Hello from non-functional children!</Text>
          </View>
        </ResponsiveImageView>,
      ),
    ).toMatchSnapshot();
  });

  it('should not render anything if no renderer was provided', () => {
    expect(
      shallow(<ResponsiveImageView source={{ uri: mockUriGood }} />).type(),
    ).toBeNull();
  });
});

describe('component injection', () => {
  it('should render the component with expected parameters on success', () => {
    const MyRenderComponent = props => <View {...props} />;
    expect(
      shallow(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          component={MyRenderComponent}
        />,
      ),
    ).toMatchSnapshot();
  });

  it('should render the component with expected parameters on failure', () => {
    const MyRenderComponent = props => <View {...props} />;
    expect(
      shallow(
        <ResponsiveImageView
          source={{ uri: mockUriBad }}
          component={MyRenderComponent}
        />,
      ),
    ).toMatchSnapshot();
  });

  it('should render class components', () => {
    // eslint-disable-next-line react/prefer-stateless-function
    class MyRenderClassComponent extends React.Component {
      render() {
        return <View {...this.props} />;
      }
    }
    expect(
      shallow(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          component={MyRenderClassComponent}
        />,
      ),
    ).toMatchSnapshot();
  });
});

describe('render prop', () => {
  it('should call render with expected parameters on success', () => {
    const render = jest.fn();
    shallow(
      <ResponsiveImageView source={{ uri: mockUriGood }} render={render} />,
    );
    expect(render.mock.calls).toMatchSnapshot();
  });

  it('should call render with expected parameters on failure', () => {
    const render = jest.fn();
    shallow(
      <ResponsiveImageView source={{ uri: mockUriBad }} render={render} />,
    );
    expect(render.mock.calls).toMatchSnapshot();
  });
});

describe('function-as-children', () => {
  it('should call children with expected parameters on success', () => {
    const children = jest.fn();
    shallow(
      <ResponsiveImageView source={{ uri: mockUriGood }}>
        {children}
      </ResponsiveImageView>,
    );
    expect(children.mock.calls).toMatchSnapshot();
  });

  it('should call children with expected parameters on failure', () => {
    const children = jest.fn();
    shallow(
      <ResponsiveImageView source={{ uri: mockUriBad }}>
        {children}
      </ResponsiveImageView>,
    );
    expect(children.mock.calls).toMatchSnapshot();
  });
});

describe('getViewProps', () => {
  it('should include consumer provided aspectRatio', () =>
    new Promise((resolve, reject) => {
      shallow(
        <ResponsiveImageView
          aspectRatio={aspectRatio}
          source={{ uri: mockUriGood }}
          onError={reject}
          onLoad={resolve}
          render={({ getViewProps }) => {
            expect(getViewProps()).toMatchSnapshot();
          }}
        />,
      );
    }));

  it('should calculate aspectRatio if not provided', () =>
    new Promise((resolve, reject) => {
      shallow(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          onError={reject}
          onLoad={resolve}
          render={({ getViewProps }) => {
            expect(getViewProps()).toMatchSnapshot();
          }}
        />,
      );
    }));

  it('should compose consumer props with own props', () =>
    new Promise((resolve, reject) => {
      shallow(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          onError={reject}
          onLoad={resolve}
          render={({ getViewProps }) => {
            expect(getViewProps({ ...consumerViewProps })).toMatchSnapshot();
          }}
        />,
      );
    }));
});

describe('getImageProps', () => {
  it('should set height and width to 100%', () =>
    new Promise((resolve, reject) => {
      shallow(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          onError={reject}
          onLoad={resolve}
          render={({ getImageProps }) => {
            expect(getImageProps()).toMatchSnapshot();
          }}
        />,
      );
    }));

  it('should compose consumer props with own props', () =>
    new Promise((resolve, reject) => {
      shallow(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          onError={reject}
          onLoad={resolve}
          render={({ getImageProps }) => {
            expect(getImageProps({ ...consumerImageProps })).toMatchSnapshot();
          }}
        />,
      );
    }));
});

describe('completion callbacks', () => {
  it('should call provided onLoad on URI success', () =>
    new Promise((resolve, reject) => {
      shallow(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          onLoad={resolve}
          onError={reject}
        />,
      );
    }));

  it('should call provided onError on URI failure', () =>
    new Promise((resolve, reject) => {
      shallow(
        <ResponsiveImageView
          source={{ uri: mockUriBad }}
          onLoad={reject}
          onError={resolve}
        />,
      );
    }));

  it('should call provided onLoad on imported resource success', () =>
    new Promise((resolve, reject) => {
      shallow(
        <ResponsiveImageView
          source={mockResourceGood}
          onLoad={resolve}
          onError={reject}
        />,
      );
    }));

  it('should call provided onError on imported resource failure', () =>
    new Promise((resolve, reject) => {
      shallow(
        <ResponsiveImageView
          source={mockResourceBad}
          onLoad={reject}
          onError={resolve}
        />,
      );
    }));

  it('should not call onLoad on success after unmounting', () =>
    new Promise((resolve, reject) => {
      const wrapper = shallow(
        <ResponsiveImageView
          source={{ uri: mockUriSlowGood }}
          onLoad={reject}
          onError={reject}
        />,
      );
      wrapper.unmount();
      setImmediate(resolve);
    }));

  it('should not call onError on failure after unmounting', () =>
    new Promise((resolve, reject) => {
      const wrapper = shallow(
        <ResponsiveImageView
          source={{ uri: mockUriSlowBad }}
          onLoad={reject}
          onError={reject}
        />,
      );
      wrapper.unmount();
      setImmediate(resolve);
    }));
});
