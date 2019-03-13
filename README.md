# react-native-responsive-image-view

_React Native component for scaling an `Image` within the parent `View`_

[![npm Version][npm-image]][npm-url] [![Build Status][ci-image]][ci-url]
[![Code Coverage][coverage-image]][coverage-url]
[![semantic-release][semantic-release-image]][semantic-release-url]

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
it with a `View` that has its [`aspectRatio`][aspectratio] style property set to
match the aspect ratio you want. It uses a [render prop][render-props] which
gives you maximum flexibility with a minimal API because you are responsible for
the rendering of everything and you simply apply props to what you're rendering.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
- [Basic Props](#basic-props)
  - [onLoad](#onload)
  - [onError](#onerror)
  - [source](#source)
  - [component](#component)
  - [render](#render)
  - [children](#children)
- [Advanced Props](#advanced-props)
  - [aspectRatio](#aspectratio)
- [Render Prop Function](#render-prop-function)
  - [prop getters](#prop-getters)
    - [`getViewProps`](#getviewprops)
    - [`getImageProps`](#getimageprops)
  - [state](#state)
- [Examples](#examples)
  - [Responsive Remote Image](#responsive-remote-image)
  - [Fixed (Controlled) Aspect Ratio and Local Image Resource](#fixed-controlled-aspect-ratio-and-local-image-resource)
  - [Touchable](#touchable)
  - [Loading and Error Handling](#loading-and-error-handling)
  - [Composing Props](#composing-props)
  - [Success/Failure Callbacks](#successfailure-callbacks)
- [Snack Playground](#snack-playground)
- [Inspiration](#inspiration)
- [Other Solutions](#other-solutions)
- [LICENSE](#license)

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
  <ResponsiveImageView source={{ uri: imageUri }}>
    {({ getViewProps, getImageProps }) => (
      <View {...getViewProps()}>
        <Image {...getImageProps()} />
      </View>
    )}
  </ResponsiveImageView>
);
```

**N.B.** This component doesn't render anything itself, it just calls your
render function or injected component and renders that. ["Use a render
prop!"][use-a-render-prop] Just be sure to render the `Image` inside the `View`
in your `render` function.

> In addition to a literal `render` prop, it also supports the component
> injection and function-as-children patterns if you prefer. See the
> [Render Prop Function](#render-prop-function) section for details.

## Basic Props

### onLoad

> `function()` | optional, no useful default

Called after the image has been loaded (and the aspect ratio has been
calculated).

### onError

> `function(error: string)` | optional, no useful default

Called if the image could not be loaded. Called with the error message in the
form of a string.

- `error`: the error message as a string

### source

> `number`/`object` | _required_

The source for your `Image`. This can be a local file resource (the result of an
`import` or `require` statement) or an object containing a `uri` key with a
remote URL as its value.

### component

> `component` | _optional_

This is rendered with an object passed in as `props`. Read more about the
properties of this object in the [Render Prop Function](#render-prop-function)
section.

### render

> `function({})` | _optional_

This is called with an object. Read more about the properties of this object in
the [Render Prop Function](#render-prop-function) section.

### children

> `function({})` | _optional_

This is called with an object. Read more about the properties of this object in
the [Render Prop Function](#render-prop-function) section.

## Advanced Props

### aspectRatio

> `number` | **control prop**, default: automatically calculated from image
> dimensions

By default, `react-native-responsive-image-view` manages this value internally
based on the dimensions of the source image. However, if more control is needed,
you can pass in a fixed aspect ratio to use instead. This is useful if you want
to fit the image into a statically shaped box such as a navigation drawer
header.

## Render Prop Function

This is where you render whatever you want to based on the state of
`react-native-responsive-image-view`. It's just a function or component,
available in a few different ways. Read Donavon West's very opinionated but
informative [post about them][faccs-and-ci] for more information. They all
receive the same props, so it is purely a stylistic choice left up to you as the
consumer.

```jsx
// component injection
<ResponsiveImageView component={/* right here */} />

// render prop
<ResponsiveImageView render={/* right here */} />

// function-as-children
<ResponsiveImageView>
  {/* right here */}
</ResponsiveImageView>
```

**N.B.** Multiple render methods should not be combined, but in the event that
they are, `react-native-responsive-image-view` will honor the following order:

1.  `component`
1.  `render`
1.  function as `children`
1.  non-functional `children` (render children normally)
1.  `null` (render nothing)

The function or component you pass in gets called with a props object containing
important properties you'll need for rendering. The properties of this object
can be split into two categories as indicated below:

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
      >
        {this.renderImageView}
      </ResponsiveImageView>
    );
  }
}
```

## Snack Playground

Check out the [Snack Playground][snack-playground] for an interactive experience
where you can try out the various usage patterns. You can see the code run live
on your own device via the [Expo client][expo-client], or enable the Preview
option to use the in-browser simulators!

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

- [`react-native-flex-image`][react-native-flex-image]

Unfortunately, it is too restrictive for my use cases. It renders the magic
`<View><Image /></View>` combination for you, preventing you from customizing
the layout. For example, it provides an `onPress` prop if you want to make the
`Image` touchable, but it wraps the `Image` in a `TouchableOpacity` (what if I
wanted a `TouchableHighlight` instead?). It also renders its own loading
indicator (an `ActivityIndicator`) as well as error messages (as `Text`). At the
end of the day, these features proved to be too opinionated.

## LICENSE

[MIT][license]

[npm-image]:
  https://img.shields.io/npm/v/react-native-responsive-image-view.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/react-native-responsive-image-view
[ci-image]:
  https://img.shields.io/circleci/project/github/wKovacs64/react-native-responsive-image-view/master.svg?style=flat-square
[ci-url]: https://circleci.com/gh/wKovacs64/react-native-responsive-image-view
[coverage-image]:
  https://img.shields.io/codecov/c/github/wKovacs64/react-native-responsive-image-view/master.svg?style=flat-square
[coverage-url]:
  https://codecov.io/gh/wKovacs64/react-native-responsive-image-view/branch/master
[semantic-release-image]:
  https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[aspectratio]:
  https://facebook.github.io/react-native/docs/layout-props#aspectratio
[render-props]: https://reactjs.org/docs/render-props.html
[npm]: https://www.npmjs.com/
[yarn]: https://yarnpkg.com/
[react-native-flex-image]: https://github.com/kodefox/react-native-flex-image
[snack-playground]: https://snack.expo.io/@wkovacs64/responsiveimageview
[expo-client]: https://expo.io/tools#client
[kodefox]: https://github.com/kodefox
[mjackson]: https://github.com/mjackson
[use-a-render-prop]:
  https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce
[faccs-and-ci]: http://americanexpress.io/faccs-are-an-antipattern/
[kentcdodds]: https://github.com/kentcdodds
[kent-prop-getters]:
  https://blog.kentcdodds.com/how-to-give-rendering-control-to-users-with-prop-getters-549eaef76acf
[downshift]: https://github.com/paypal/downshift
[license]:
  https://github.com/wKovacs64/react-native-responsive-image-view/tree/master/LICENSE.txt
