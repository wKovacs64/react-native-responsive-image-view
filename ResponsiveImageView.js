import { Component } from 'react';
import { Image } from 'react-native';
import PropTypes from 'prop-types';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

class ResponsiveImageView extends Component {
  // eslint-disable-next-line react/sort-comp
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

  getImageProps = ({ source, style = {}, ...props } = {}) => ({
    source: this.props.source,
    style: [style, { height: '100%', width: '100%' }],
    ...props,
  });

  getViewProps = ({ style = {}, ...props } = {}) => ({
    style: [style, { aspectRatio: this.state.aspectRatio }],
    ...props,
  });

  handleImageSizeSuccess = (width, height) => {
    const { aspectRatio } = this.props;
    this.setState(
      {
        ...this.initialState,
        loading: false,
        aspectRatio: aspectRatio || width / height,
      },
      () => this.props.onLoad(),
    );
  };

  handleImageSizeFailure = err => {
    this.setState(
      {
        ...this.initialState,
        loading: false,
        error: err.message,
      },
      () => this.props.onError(this.state.error),
    );
  };

  render() {
    return this.props.render({
      loading: this.state.loading,
      error: this.state.error,
      getImageProps: this.getImageProps,
      getViewProps: this.getViewProps,
    });
  }
}

ResponsiveImageView.displayName = 'ResponsiveImageView';

ResponsiveImageView.propTypes = {
  aspectRatio: PropTypes.number,
  render: PropTypes.func,
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
  render: () => null,
  onError: () => {},
  onLoad: () => {},
};

export default ResponsiveImageView;
