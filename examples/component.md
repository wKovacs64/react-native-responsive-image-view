## Component Examples

#### Responsive Remote Image

```jsx
import React from 'react';
import { Image, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';

const MyComponent = ({ imageUri }) => (
  <ResponsiveImageView source={{ uri: imageUri }}>
    {({ getViewProps, getImageProps }) => (
      <View {...getViewProps()}>
        <Image {...getImageProps()} />
      </View>
    )}
  </ResponsiveImageView>
);
```

#### Fixed (Controlled) Aspect Ratio and Local Image Resource

```jsx
import React from 'react';
import { Image, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';
import headerImage from './header.jpg';

const DrawerHeader = () => (
  <ResponsiveImageView aspectRatio={16 / 9} source={headerImage}>
    {({ getViewProps, getImageProps }) => (
      <View {...getViewProps()}>
        <Image {...getImageProps()} />
      </View>
    )}
  </ResponsiveImageView>
);
```

#### Touchable

```jsx
import React from 'react';
import { Image, TouchableHighlight, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';

const MyTouchableComponent = ({ imageUri, onPress }) => (
  <ResponsiveImageView source={{ uri: imageUri }}>
    {({ getViewProps, getImageProps }) => (
      <View {...getViewProps()}>
        <TouchableHighlight onPress={onPress}>
          <Image {...getImageProps()} />
        </TouchableHighlight>
      </View>
    )}
  </ResponsiveImageView>
);
```

#### Loading and Error Handling

```jsx
import React from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';

const MyComponent = ({ imageUri }) => (
  <ResponsiveImageView source={{ uri: imageUri }}>
    {({ error, loading, getViewProps, getImageProps }) => {
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
    }}
  </ResponsiveImageView>
);
```

#### Composing Props

```jsx
import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';

const styles = StyleSheet.create({
  imageContainer: {
    padding: 20, // will be merged into ResponsiveImageView View props!
  },
  image: {
    width: '50%', // will be overwritten by ResponsiveImageView Image props!
  },
});

const MyComponent = ({ imageUri }) => (
  <ResponsiveImageView source={{ uri: imageUri }}>
    {({ getViewProps, getImageProps }) => (
      <View {...getViewProps({ style: styles.imageContainer })}>
        <Image {...getImageProps({ style: styles.image })} />
      </View>
    )}
  </ResponsiveImageView>
);
```

#### Success/Failure Callbacks

```jsx
import React from 'react';
import { Image, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';

class MyClassComponent extends React.Component {
  onLoad = () => {
    console.log('Image has been loaded.');
  };

  onError = (err) => {
    console.error(err);
  };

  renderImageView = ({ getViewProps, getImageProps }) => (
    <View {...getViewProps()}>
      <Image {...getImageProps()} />
    </View>
  );

  render() {
    const { imageUri } = this.props;

    return (
      <ResponsiveImageView
        onLoad={this.onLoad}
        onError={this.onError}
        source={{ uri: imageUri }}
      >
        {this.renderImageView}
      </ResponsiveImageView>
    );
  }
}
```
