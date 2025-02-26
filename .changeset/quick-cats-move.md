---
'react-native-responsive-image-view': major
---

### Breaking Changes

#### Component Import

- The `ResponsiveImageView` component is now a named export instead of the default export. Migrate easily:

  ```diff
  -import ResponsiveImageView from 'react-native-responsive-image-view';
  +import { ResponsiveImageView } from 'react-native-responsive-image-view';
  ```

- You shouldn't have to memoize the `onLoad` and `onError` callbacks anymore if you were doing so previously.

#### TypeScript

- `ResponsiveImageViewProps` is now a type rather than an interface (should only impact you if you were extending it)
- `ResponsiveImageView` return type changed from `React.ReactElement<ResponsiveImageViewProps> | null` to `React.JSX.Element | null` which is more accurate
- new `UseResponsiveImageViewOptions` type exported
