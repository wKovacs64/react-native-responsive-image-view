import * as React from 'react';
import {
  Image,
  type ViewProps,
  type ImageProps,
  type ImageURISource,
  type ImageRequireSource,
} from 'react-native';

// Output
export type ResponsiveImageViewBag = {
  loading: boolean;
  error: string;
  retry: () => void;
  getViewProps: (props?: ViewProps) => ViewProps;
  getImageProps: (
    props?: Omit<ImageProps, 'source'> & { source?: ImageProps['source'] },
  ) => ImageProps;
};

// Hook options
export type UseResponsiveImageViewOptions = {
  source: ImageURISource | ImageRequireSource;
  aspectRatio?: number;
  onLoad?: () => void;
  onError?: (errMessage: string) => void;
};

// Component props
export type ResponsiveImageViewProps = UseResponsiveImageViewOptions & {
  component?: React.ComponentType<any>;
  render?: (bag: ResponsiveImageViewBag) => React.JSX.Element;
  children?: ((bag: ResponsiveImageViewBag) => React.JSX.Element) | React.ReactNode;
};

// A cancelable version of Image.getSize, adapted from
// https://github.com/kodefox/react-native-flex-image
function getImageSize(
  uri: Parameters<typeof Image.getSize>[0],
  onImageSizeSuccess: Parameters<typeof Image.getSize>[1],
  onImageSizeFailure: Parameters<typeof Image.getSize>[2],
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
        onImageSizeFailure?.(err);
      }
    },
  );

  return {
    cancel: () => {
      totallyCanceled = true;
    },
  };
}

type State = {
  loading: boolean;
  error: string;
  retryCount: number;
  aspectRatio: number | undefined;
};

type Action =
  | { type: 'SUCCESS'; payload: number }
  | { type: 'FAILURE'; payload: string }
  | { type: 'RETRY' };

const initialState: State = { loading: true, error: '', retryCount: 0, aspectRatio: undefined };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'SUCCESS': {
      return {
        ...initialState,
        loading: false,
        retryCount: state.retryCount,
        aspectRatio: action.payload,
      };
    }
    case 'FAILURE': {
      return {
        ...initialState,
        loading: false,
        error: action.payload,
        retryCount: state.retryCount,
      };
    }
    case 'RETRY': {
      return { ...initialState, retryCount: state.retryCount + 1 };
    }
    /* istanbul ignore next: this will never happen */
    default: {
      throw new Error('Unexpected action type');
    }
  }
}

function defaultOnLoad() {}
function defaultOnError(_: string) {}

export function useResponsiveImageView({
  aspectRatio: controlledAspectRatio,
  source: initialSource,
  onLoad = defaultOnLoad,
  onError = defaultOnError,
}: UseResponsiveImageViewOptions): ResponsiveImageViewBag {
  if (!initialSource) {
    throw new Error('"source" is required');
  }

  // Latest ref pattern for callbacks
  const onLoadRef = React.useRef(onLoad);
  const onErrorRef = React.useRef(onError);

  React.useEffect(() => {
    onLoadRef.current = onLoad;
    onErrorRef.current = onError;
  }, [onError, onLoad]);

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
      onLoadRef.current();
      dispatch({ type: 'SUCCESS', payload: width / height });
    }

    function handleImageSizeFailure(err: any) {
      const errMessage =
        err instanceof Error ? err.message : /* istanbul ignore next */ String(err);
      onErrorRef.current(errMessage);
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
    // them do that when we don't have to?
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialSource), state.retryCount]);

  return { loading: state.loading, error: state.error, retry, getViewProps, getImageProps };
}

export function ResponsiveImageView({
  source,
  component: Component = undefined,
  render = undefined,
  children = undefined,
  aspectRatio = undefined,
  onLoad = defaultOnLoad,
  onError = defaultOnError,
}: ResponsiveImageViewProps): React.JSX.Element | null {
  const bag = useResponsiveImageView({ aspectRatio, source, onLoad, onError });

  // component injection
  if (Component) {
    return <Component {...bag} />;
  }

  // render prop
  if (typeof render === 'function') {
    return render(bag);
  }

  // function-as-children
  if (typeof children === 'function') {
    return children(bag);
  }

  // no renderer provided, but children exist - just render the children as-is
  if (children && React.Children.count(children) > 0) {
    return <React.Fragment>{React.Children.only(children)}</React.Fragment>;
  }

  return null;
}

ResponsiveImageView.displayName = 'ResponsiveImageView';
