# Change Log

## 3.0.0

### Major Changes

- [#239](https://github.com/wKovacs64/react-native-responsive-image-view/pull/239) [`0490d52`](https://github.com/wKovacs64/react-native-responsive-image-view/commit/0490d5287bad2743f86193eda7ad18717f03db66) Thanks [@wKovacs64](https://github.com/wKovacs64)! - Update major dev dependencies (react-native 0.78 and React 19) and refactor some internals.

  ### BREAKING CHANGES

  #### Component Import
  - The `ResponsiveImageView` component is now a named export instead of the default export. Migrate easily:

    ```diff
    -import ResponsiveImageView from 'react-native-responsive-image-view';
    +import { ResponsiveImageView } from 'react-native-responsive-image-view';
    ```

  #### TypeScript
  - `ResponsiveImageViewProps` is now a type rather than an interface (should only impact you if you were extending it)

  ### Features and Fixes
  - You shouldn't have to memoize the `onLoad` and `onError` callbacks anymore if you were doing so previously
  - `ResponsiveImageView` return type changed from `React.ReactElement<ResponsiveImageViewProps> | null` to `React.JSX.Element | null` which is more accurate
  - New `UseResponsiveImageViewOptions` type for hook options

## 2.2.0

### Minor Changes

- [#190](https://github.com/wKovacs64/react-native-responsive-image-view/pull/190) [`9d00c38`](https://github.com/wKovacs64/react-native-responsive-image-view/commit/9d00c380425b8a37c7519ba4ae92be21f8edb8b0) Thanks [@wKovacs64](https://github.com/wKovacs64)! - Convert project to TypeScript. Removes the `prop-types` peer dependency.
