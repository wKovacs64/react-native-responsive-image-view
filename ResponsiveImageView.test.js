import React from 'react';
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
  onLayout: jest.fn(),
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
describe('ResponsiveImageView', () => {
  it('should call provided render prop with expected parameters on success', () => {
    const render = jest.fn();
    shallow(
      <ResponsiveImageView source={{ uri: mockUriGood }} render={render} />,
    );
    expect(render.mock.calls).toMatchSnapshot();
  });

  it('should call provided render prop with expected parameters on failure', () => {
    const render = jest.fn();
    shallow(
      <ResponsiveImageView source={{ uri: mockUriBad }} render={render} />,
    );
    expect(render.mock.calls).toMatchSnapshot();
  });

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

  it('should call render on success even if no onLoad was provided', () =>
    new Promise(resolve => {
      shallow(
        <ResponsiveImageView source={{ uri: mockUriGood }} render={resolve} />,
      );
    }));

  it('should call render on failure even if no onError was provided', () =>
    new Promise(resolve => {
      shallow(
        <ResponsiveImageView source={{ uri: mockUriBad }} render={resolve} />,
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

  it('should not render anything if no render prop was provided', () => {
    expect(
      shallow(<ResponsiveImageView source={{ uri: mockUriGood }} />).type(),
    ).toBeNull();
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
              expect(
                getImageProps({ ...consumerImageProps }),
              ).toMatchSnapshot();
            }}
          />,
        );
      }));
  });
});
