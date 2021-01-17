import React from 'react';
import { Image } from 'react-native';

// A cancelable version of Image.getSize, adapted from
// https://github.com/kodefox/react-native-flex-image
function getImageSize(uri, onImageSizeSuccess, onImageSizeFailure) {
  let totallyCanceled = false;

  Image.getSize(
    uri,
    (width, height) => {
      if (!totallyCanceled) {
        onImageSizeSuccess(width, height);
      }
    },
    (err) => {
      if (!totallyCanceled) {
        onImageSizeFailure(err);
      }
    },
  );

  return {
    cancel: () => {
      totallyCanceled = true;
    },
  };
}

const initialState = {
  loading: true,
  error: '',
  retryCount: 0,
  aspectRatio: undefined,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SUCCESS':
      return {
        ...initialState,
        loading: false,
        retryCount: state.retryCount,
        aspectRatio: action.payload,
      };
    case 'FAILURE':
      return {
        ...initialState,
        loading: false,
        error: action.payload,
        retryCount: state.retryCount,
      };
    case 'RETRY':
      return {
        ...initialState,
        retryCount: state.retryCount + 1,
      };
    /* istanbul ignore next: this will never happen */
    default:
      throw new Error(`Unexpected action type: ${action.type}`);
  }
}

const noop = () => {};

function useResponsiveImageView({
  aspectRatio: controlledAspectRatio,
  source: initialSource,
  onLoad = noop,
  onError = noop,
}) {
  if (!initialSource) {
    throw new Error('"source" is required');
  }

  const [state, dispatch] = React.useReducer(reducer, initialState);

  function retry() {
    dispatch({ type: 'RETRY' });
  }

  function isAspectRatioControlled() {
    return controlledAspectRatio !== undefined;
  }

  function getAspectRatio() {
    return isAspectRatioControlled()
      ? controlledAspectRatio
      : state.aspectRatio;
  }

  function getImageProps({ source, style = {}, ...props } = {}) {
    return {
      source: initialSource,
      style: [style, { height: '100%', width: '100%' }],
      ...props,
    };
  }

  function getViewProps({ style = {}, ...props } = {}) {
    return {
      style: [style, { aspectRatio: getAspectRatio() }],
      ...props,
    };
  }

  React.useEffect(() => {
    let pendingGetImageSize = {
      cancel: /* istanbul ignore next: just a stub  */ () => {},
    };

    function handleImageSizeSuccess(width, height) {
      onLoad();
      dispatch({ type: 'SUCCESS', payload: width / height });
    }

    function handleImageSizeFailure(err) {
      onError(err.message);
      dispatch({ type: 'FAILURE', payload: err.message });
    }

    if (initialSource.uri) {
      // Retrieve image dimensions from URI
      pendingGetImageSize = getImageSize(
        initialSource.uri,
        handleImageSizeSuccess,
        handleImageSizeFailure,
      );
    } else {
      // Retrieve image dimensions from imported resource
      const imageSource = Image.resolveAssetSource(initialSource);
      if (imageSource && imageSource.width && imageSource.height) {
        const { width, height } = imageSource;
        handleImageSizeSuccess(width, height);
      } else {
        handleImageSizeFailure(
          new Error('Failed to retrieve image dimensions.'),
        );
      }
    }

    return () => {
      pendingGetImageSize.cancel();
    };
    // Using JSON.stringify here because the `source` parameter can be a nested
    // object. The alternative is requiring the user to memoize it, by why make
    // them do that when we don't have to? (Note: they already have to memoize
    // onLoad and onError, but those are much less likely to be used.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialSource), onLoad, onError, state.retryCount]);

  return {
    loading: state.loading,
    error: state.error,
    retry,
    getViewProps,
    getImageProps,
  };
}

export default useResponsiveImageView;
