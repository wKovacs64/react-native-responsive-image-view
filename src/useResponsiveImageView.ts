import * as React from 'react';
import {
  Image,
  type ViewProps,
  type ImageProps,
  type ImageURISource,
  type ImageRequireSource,
} from 'react-native';

type ImagePropsWithSourceIgnored = { source?: ImageProps['source'] } & Omit<ImageProps, 'source'>;

export interface ResponsiveImageViewBag {
  loading: boolean;
  error: string;
  retry: () => void;
  getViewProps: (props?: ViewProps) => ViewProps;
  getImageProps: (props?: ImagePropsWithSourceIgnored) => ImageProps;
}

type RenderFunctionReturnType = React.ReactElement<ResponsiveImageViewProps> | null;

export interface ResponsiveImageViewProps {
  aspectRatio?: number;
  component?: React.ComponentType | React.FunctionComponent;
  render?: (bag: ResponsiveImageViewBag) => RenderFunctionReturnType;
  children?: ((bag: ResponsiveImageViewBag) => RenderFunctionReturnType) | React.ReactNode;
  onError?: (errMessage: string) => void;
  onLoad?: () => void;
  source: ImageURISource | ImageRequireSource;
}

// A cancelable version of Image.getSize, adapted from
// https://github.com/kodefox/react-native-flex-image
function getImageSize(
  uri: string,
  onImageSizeSuccess: (width: number, height: number) => void,
  onImageSizeFailure: (err: any) => void,
) {
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

interface State {
  loading: boolean;
  error: string;
  retryCount: number;
  aspectRatio: number | undefined;
}

type Action =
  | { type: 'SUCCESS'; payload: number }
  | { type: 'FAILURE'; payload: string }
  | { type: 'RETRY' };

const initialState: State = { loading: true, error: '', retryCount: 0, aspectRatio: undefined };

function reducer(state: State, action: Action) {
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
      return { ...initialState, retryCount: state.retryCount + 1 };
    /* istanbul ignore next: this will never happen */
    default:
      throw new Error('Unexpected action type');
  }
}

function defaultOnLoad() {}
function defaultOnError(_: string) {}

export function useResponsiveImageView({
  aspectRatio: controlledAspectRatio,
  source: initialSource,
  onLoad = defaultOnLoad,
  onError = defaultOnError,
}: ResponsiveImageViewProps): ResponsiveImageViewBag {
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
    return isAspectRatioControlled() ? controlledAspectRatio : state.aspectRatio;
  }

  function getImageProps({
    source,
    style = {},
    ...props
  }: Parameters<ResponsiveImageViewBag['getImageProps']>[0] = {}) {
    const imageProps: ImageProps = {
      source: initialSource,
      style: [style, { height: '100%', width: '100%' }],
      ...props,
    };
    return imageProps;
  }

  function getViewProps({
    style = {},
    ...props
  }: Parameters<ResponsiveImageViewBag['getViewProps']>[0] = {}) {
    return { style: [style, { aspectRatio: getAspectRatio() }], ...props };
  }

  React.useEffect(() => {
    let pendingGetImageSize = { cancel: /* istanbul ignore next: just a stub  */ () => {} };

    function handleImageSizeSuccess(width: number, height: number) {
      onLoad();
      dispatch({ type: 'SUCCESS', payload: width / height });
    }

    function handleImageSizeFailure(err: any) {
      const errMessage =
        err instanceof Error ? err.message : /* istanbul ignore next */ String(err);
      onError(errMessage);
      dispatch({ type: 'FAILURE', payload: errMessage });
    }

    if (typeof initialSource === 'object' && initialSource.uri) {
      // Retrieve image dimensions from URI
      pendingGetImageSize = getImageSize(
        initialSource.uri,
        handleImageSizeSuccess,
        handleImageSizeFailure,
      );
    } else {
      // Retrieve image dimensions from imported resource
      const imageSource = Image.resolveAssetSource(initialSource);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (imageSource) {
        handleImageSizeSuccess(imageSource.width, imageSource.height);
      } else {
        handleImageSizeFailure(new Error('Failed to retrieve image dimensions.'));
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

  return { loading: state.loading, error: state.error, retry, getViewProps, getImageProps };
}
