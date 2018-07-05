import React, { Component } from 'react';
import { Image } from 'react-native';
import PropTypes from 'prop-types';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

class ResponsiveImageView extends Component {
  initialState = {
    loading: true,
    error: '',
    aspectRatio: undefined,
  };

  state = this.initialState;

  componentDidMount() {
    const { source } = this.props;
    if (source.uri) {
      // Retrieve image dimensions from URI
      this.pendingGetImageSize = this.getImageSize(
        source.uri,
        this.handleImageSizeSuccess,
        this.handleImageSizeFailure,
      );
    } else {
      // Retrieve image dimensions from imported resource
      const imageSource = resolveAssetSource(source);
      if (imageSource && imageSource.width && imageSource.height) {
        const { width, height } = imageSource;
        this.handleImageSizeSuccess(width, height);
      } else {
        this.handleImageSizeFailure(
          new Error('Failed to retrieve image dimensions.'),
        );
      }
    }
  }

  componentWillUnmount() {
    // istanbul ignore else: noop
    if (this.pendingGetImageSize) {
      this.pendingGetImageSize.cancel();
    }
  }

  // A cancelable version of Image.getSize, adapted from
  // https://github.com/kodefox/react-native-flex-image
  getImageSize = (uri, onImageSizeSuccess, onImageSizeFailure) => {
    let totallyCanceled = false;

    Image.getSize(
      uri,
      (width, height) => {
        if (!totallyCanceled) {
          onImageSizeSuccess(width, height);
        }
      },
      error => {
        if (!totallyCanceled) {
          onImageSizeFailure(error);
        }
      },
    );

    return {
      cancel: () => {
        totallyCanceled = true;
      },
    };
  };

  getAspectRatio = () => this.props.aspectRatio || this.state.aspectRatio;

  getImageProps = ({ source, style = {}, ...props } = {}) => ({
    source: this.props.source,
    style: [style, { height: '100%', width: '100%' }],
    ...props,
  });

  getViewProps = ({ style = {}, ...props } = {}) => ({
    style: [style, { aspectRatio: this.getAspectRatio() }],
    ...props,
  });

  handleImageSizeSuccess = (width, height) => {
    const { onLoad } = this.props;
    this.setState(
      {
        ...this.initialState,
        loading: false,
        aspectRatio: width / height,
      },
      () => onLoad(),
    );
  };

  handleImageSizeFailure = err => {
    const { onError } = this.props;
    this.setState(
      {
        ...this.initialState,
        loading: false,
        error: err.message,
      },
      () => onError(this.state.error),
    );
  };

  render() {
    const { component: ComponentOrFunction, render, children } = this.props;
    const { loading, error } = this.state;
    const bag = {
      loading,
      error,
      getImageProps: this.getImageProps,
      getViewProps: this.getViewProps,
    };

    // component injection
    if (ComponentOrFunction) {
      // class component
      if (ComponentOrFunction.prototype.render) {
        return <ComponentOrFunction {...bag} />;
      }

      // stateless functional component (SFC)
      return ComponentOrFunction(bag);
    }

    // render prop
    if (render) {
      return render(bag);
    }

    // function-as-children
    if (typeof children === 'function') {
      return children(bag);
    }

    // no renderer provided, but children exist - just render the children as-is
    if (children && React.Children.count(children) > 0) {
      return React.Children.only(children);
    }

    return null;
  }
}

ResponsiveImageView.displayName = 'ResponsiveImageView';

ResponsiveImageView.propTypes = {
  aspectRatio: PropTypes.number,
  component: PropTypes.func,
  render: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  onError: PropTypes.func,
  onLoad: PropTypes.func,
  source: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      uri: PropTypes.string.isRequired,
    }),
  ]).isRequired,
};

ResponsiveImageView.defaultProps = {
  aspectRatio: undefined,
  component: undefined,
  render: undefined,
  children: undefined,
  onError: () => {},
  onLoad: () => {},
};

export default ResponsiveImageView;
