# react-native-responsive-image-view

_React Native component for scaling an `Image` within the parent `View`_

[![npm Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]
[![Code Coverage][coverage-image]][coverage-url]

## The problem

You want to display an image in your React Native app that fills the width of
its container and scales its height according to the aspect ratio of the image.
If you're coming from front-end web development, you may be familiar with
Bootstrap 3's `img-responsive` class or manually applying `max-width: 100%` and
`height: auto` to an image. Unfortunately, `auto` is not a valid value for
`height` in React Native, so that technique doesn't quite translate.

## This solution

This is a component that calculates the aspect ratio of your image for you (or
uses a fixed value, if you supply one) and provides you with the appropriate
props to apply to a `View` container and an `Image` inside it which will produce
the results you're looking for. The secret sauce is setting both the `height`
and `width` attributes of the `style` prop on the `Image` to `100%` and wrapping
it with a `View` that has its `aspectRatio` prop set to match the aspect ratio
you want. It uses a [render prop][use-a-render-prop] which gives you maximum
flexibility with a minimal API because you are responsible for the rendering of
everything and you simply apply props to what you're rendering.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

* [Installation](#installation)
* [Usage](#usage)
* [Props](#props)
  * [aspectRatio](#aspectratio)
  * [onLoad](#onload)
  * [onError](#onerror)
  * [source](#source)
  * [render](#render)
* [Render Prop Function](#render-prop-function)
  * [prop getters](#prop-getters)
    * [`getViewProps`](#getviewprops)
    * [`getImageProps`](#getimageprops)
  * [state](#state)
* [Examples](#examples)
  * [Responsive Remote Image](#responsive-remote-image)
  * [Fixed Aspect Ratio and Local Image Resource](#fixed-aspect-ratio-and-local-image-resource)
  * [Touchable](#touchable)
  * [Loading and Error Handling](#loading-and-error-handling)
  * [Composing Props](#composing-props)
  * [Success/Failure Callbacks](#successfailure-callbacks)
* [Inspiration](#inspiration)
* [Other Solutions](#other-solutions)
* [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

Using [yarn][yarn]:

```shell
yarn add react-native-responsive-image-view
```

Or, [npm][npm]:

```shell
npm install --save react-native-responsive-image-view
```

> This package also depends on `react`, `prop-types`, and `react-native`. Please
> make sure you have those installed as well.

## Usage

```jsx
import React from 'react';
import { Image, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';

export default ({ imageUri }) => (
  <ResponsiveImageView
    source={{ uri: imageUri }}
    render={({ getViewProps, getImageProps }) => (
      <View {...getViewProps()}>
        <Image {...getImageProps()} />
      </View>
    )}
  />
);
```

**N.B.** This component doesn't render anything itself, it just calls your
render function and renders that. ["Use a render prop!"][use-a-render-prop] Just
be sure to render the `Image` inside the `View` in your `render` function.

## Props

### aspectRatio

> `number` | optional, default: automatically calculated from image dimensions

A fixed aspect ratio to use instead of calculating one from the image. This is
useful if you want to fit the image into a statically shaped box such as a
navigation drawer header.

### onLoad

> `function()` | optional, no useful default

Called after the image has been loaded (and the aspect ratio has been
calculated).

### onError

> `function(error: string)` | optional, no useful default

Called if the image could not be loaded. Called with the error message in the
form of a string.

* `error`: the error message as a string

### source

> `number`/`object` | _required_

The source for your `Image`. This can be a local file resource (the result of an
`import` or `require` statement) or an object containing a `uri` key with a
remote URL as its value.

### render

> `function({})` | _required_

This is called with an object. Read more about the properties of this object in
the [Render Prop Function](#render-prop-function) section.

## Render Prop Function

This is where you render whatever you want to based on the state of
`react-native-responsive-image-view`. It's a regular prop called `render`:

```jsx
<ResponsiveImageView render={/* right here */} />
```

The function you pass in as the render prop gets called with an object
containing important properties you'll need for rendering. The properties of
this object can be split into two categories as indicated below:

### prop getters

> See [this blog post about prop getters][kent-prop-getters]

These functions are used to apply props to the elements that you render. This
gives you maximum flexibility to render what, when, and wherever you like. You
call these on the element in question (for example:
`<View {...getViewProps()}`)). It's advisable to pass all your props to that
function rather than applying them on the element yourself to avoid your props
being overridden (or overriding the props returned). For example:
`getViewProps({ hitSlop: myHitSlop })`.

| property        | type           | description                                                                     |
| --------------- | -------------- | ------------------------------------------------------------------------------- |
| `getViewProps`  | `function({})` | returns the props you should apply to the `View` (parent of `Image`) you render |
| `getImageProps` | `function({})` | returns the props you should apply to the `Image` (child of `View`) you render  |

#### `getViewProps`

This method should be applied to the `View` you render. It is recommended that
you pass all props as an object to this method which will compose together any
of the props you need to apply to the `View` while preserving the ones that
`react-native-responsive-image-view` needs to apply to make the `View` behave.

There are no required properties for this method.

#### `getImageProps`

This method should be applied to the `Image` you render. It is recommended that
you pass all props as an object to this method which will compose together any
of the props you need to apply to the `Image` while preserving the ones that
`react-native-responsive-image-view` needs to apply to make the `Image` behave.

There are no required properties for this method.

### state

These are values that represent the current state of the component.

| property  | type      | description                                                    |
| --------- | --------- | -------------------------------------------------------------- |
| `loading` | `boolean` | whether or not the image is currently loading                  |
| `error`   | `string`  | an error message if the image failed to load (`''` on success) |

## Examples

#### Responsive Remote Image

```jsx
import React from 'react';
import { Image, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';

const MyComponent = ({ imageUri }) => (
  <ResponsiveImageView
    source={{ uri: imageUri }}
    render={({ getViewProps, getImageProps }) => (
      <View {...getViewProps()}>
        <Image {...getImageProps()} />
      </View>
    )}
  />
);
```

#### Fixed Aspect Ratio and Local Image Resource

```jsx
import React from 'react';
import { Image, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';
import headerImage from './header.jpg';

const DrawerHeader = () => (
  <ResponsiveImageView
    aspectRatio={16 / 9}
    source={headerImage}
    render={({ getViewProps, getImageProps }) => (
      <View {...getViewProps()}>
        <Image {...getImageProps()} />
      </View>
    )}
  />
);
```

#### Touchable

```jsx
import React from 'react';
import { Image, TouchableHighlight, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';

const MyTouchableComponent = ({ imageUri, onPress }) => (
  <ResponsiveImageView
    source={{ uri: imageUri }}
    render={({ getViewProps, getImageProps }) => (
      <View {...getViewProps()}>
        <TouchableHighlight onPress={onPress}>
          <Image {...getImageProps()} />
        </TouchableHighlight>
      </View>
    )}
  />
);
```

#### Loading and Error Handling

```jsx
import React from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';

const MyComponent = ({ imageUri }) => (
  <ResponsiveImageView
    source={{ uri: imageUri }}
    render={({ error, loading, getViewProps, getImageProps }) => {
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
  />
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
  <ResponsiveImageView
    source={{ uri: imageUri }}
    render={({ getViewProps, getImageProps }) => (
      <View {...getViewProps({ style: styles.imageContainer })}>
        <Image {...getImageProps({ style: styles.image })} />
      </View>
    )}
  />
);
```

#### Success/Failure Callbacks

```jsx
import { Component } from 'react';
import { Image, View } from 'react-native';
import ResponsiveImageView from 'react-native-responsive-image-view';

class MyStatefulComponent extends Component {
  state = {
    success: false,
    error: '',
  };

  onLoad = () => {
    this.setState({
      success: true,
      error: '',
    });
  };

  onError = error => {
    this.setState({
      success: false,
      error,
    });
  };

  renderImageView = ({ getViewProps, getImageProps }) => (
    <View {...getViewProps()}>
      <Image {...getImageProps()} />
    </View>
  );

  render() {
    return (
      <ResponsiveImageView
        onLoad={this.onLoad}
        onError={this.onError}
        source={{ uri: this.props.imageUri }}
        render={this.renderImageView}
      />
    );
  }
}
```

## Inspiration

I was heavily inspired by [`react-native-flex-image`][react-native-flex-image]
from [KodeFox][kodefox] (see the [Other Solutions](#other-solutions) section)
with regards to how to display the image to get the desired behavior. For the
actual implementation and API, I was primarily inspired by [Michael
Jackson][mjackson]'s ["Use a Render Prop!"][use-a-render-prop] post and video,
as well as [Kent C. Dodds][kentcdodds]' [introduction to prop
getters][kent-prop-getters] (popularized by his [`downshift`][downshift]
project, which also provided inspiration for this README).

## Other Solutions

After scouring [npm][npm] for solutions and trying most (if not all) of them,
the best option I found was the following:

* [`react-native-flex-image`][react-native-flex-image]

Unfortunately, it is too restrictive for my use cases. It renders the magic
`<View><Image /></View>` combination for you, preventing you from customizing
the layout. For example, it provides an `onPress` prop if you want to make the
`Image` touchable, but it wraps the `Image` in a `TouchableOpacity` (what if I
wanted a `TouchableHighlight` instead?). It also renders its own loading
indicator (an `ActivityIndicator`) as well as error messages (as `Text`). At the
end of the day, these features proved to be too opinionated.

## LICENSE

[MIT][license]

[npm-image]: https://img.shields.io/npm/v/react-native-responsive-image-view.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/react-native-responsive-image-view
[travis-image]: https://img.shields.io/travis/wKovacs64/react-native-responsive-image-view.svg?style=flat-square&branch=master
[travis-url]: https://travis-ci.org/wKovacs64/react-native-responsive-image-view
[coverage-image]: https://img.shields.io/coveralls/wKovacs64/react-native-responsive-image-view.svg?style=flat-square&branch=master
[coverage-url]: https://coveralls.io/github/wKovacs64/react-native-responsive-image-view?branch=master
[npm]: https://www.npmjs.com/
[yarn]: https://yarnpkg.com/
[react-native-flex-image]: https://github.com/kodefox/react-native-flex-image
[kodefox]: https://github.com/kodefox
[mjackson]: https://github.com/mjackson
[use-a-render-prop]: https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce
[kentcdodds]: https://github.com/kentcdodds
[kent-prop-getters]: https://blog.kentcdodds.com/how-to-give-rendering-control-to-users-with-prop-getters-549eaef76acf
[downshift]: https://github.com/paypal/downshift
[license]: https://github.com/wKovacs64/react-native-responsive-image-view/tree/master/LICENSE.txt
