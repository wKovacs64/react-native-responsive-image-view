## Hook Examples

#### Responsive Remote Image

```jsx
import React from 'react';
import { Image, View } from 'react-native';
import { useResponsiveImageView } from 'react-native-responsive-image-view';

const MyComponent = ({ imageUri }) => {
  const { getViewProps, getImageProps } = useResponsiveImageView({
    source: { uri: imageUri },
  });

  return (
    <View {...getViewProps()}>
      <Image {...getImageProps()} />
    </View>
  );
};
```

#### Fixed (Controlled) Aspect Ratio and Local Image Resource

```jsx
import React from 'react';
import { Image, View } from 'react-native';
import { useResponsiveImageView } from 'react-native-responsive-image-view';
import headerImage from './header.jpg';

const DrawerHeader = () => {
  const { getViewProps, getImageProps } = useResponsiveImageView({
    aspectRatio: 16 / 9,
    source: headerImage,
  });

  return (
    <View {...getViewProps()}>
      <Image {...getImageProps()} />
    </View>
  );
};
```

#### Touchable

```jsx
import React from 'react';
import { Image, TouchableHighlight, View } from 'react-native';
import { useResponsiveImageView } from 'react-native-responsive-image-view';

const MyTouchableComponent = ({ imageUri, onPress }) => {
  const { getViewProps, getImageProps } = useResponsiveImageView({
    source: { uri: imageUri },
  });

  return (
    <View {...getViewProps()}>
      <TouchableHighlight onPress={onPress}>
        <Image {...getImageProps()} />
      </TouchableHighlight>
    </View>
  );
};
```

#### Loading and Error Handling

```jsx
import React from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useResponsiveImageView } from 'react-native-responsive-image-view';

const MyComponent = ({ imageUri }) => {
  const {
    error,
    loading,
    getViewProps,
    getImageProps,
  } = useResponsiveImageView({ source: { uri: imageUri } });

  if (loading) {
    return <ActivityIndicator animating={true} size="large" />;
  }

  if (error) {
    return (
      <View>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View {...getViewProps()}>
      <Image {...getImageProps()} />
    </View>
  );
};
```

#### Composing Props

```jsx
import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { useResponsiveImageView } from 'react-native-responsive-image-view';

const styles = StyleSheet.create({
  imageContainer: {
    padding: 20, // will be merged into RNRIV View props!
  },
  image: {
    width: '50%', // will be overwritten by RNRIV Image props!
  },
});

const MyComponent = ({ imageUri }) => {
  const { getViewProps, getImageProps } = useResponsiveImageView({
    source: { uri: imageUri },
  });

  return (
    <View {...getViewProps({ style: styles.imageContainer })}>
      <Image {...getImageProps({ style: styles.image })} />
    </View>
  );
};
```

#### Success/Failure Callbacks

```jsx
import React from 'react';
import { Image, Text, View } from 'react-native';
import { useResponsiveImageView } from 'react-native-responsive-image-view';

const MyComponentWithCallbacks = ({ imageUri }) => {
  const onLoad = React.useCallback(() => {
    console.log('Image has been loaded.');
  }, []);

  const onError = React.useCallback(err => {
    console.error(err);
  }, []);

  const { getViewProps, getImageProps } = useResponsiveImageView({
    onLoad,
    onError,
    source: { uri: imageUri },
  });

  return (
    <View {...getViewProps()}>
      <Image {...getImageProps()} />
    </View>
  );
};
```
