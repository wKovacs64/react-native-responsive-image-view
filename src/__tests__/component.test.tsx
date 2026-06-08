import * as React from "react";
import { Text, View } from "react-native";
import { act, render, screen } from "@testing-library/react-native";
import {
  mockUriGood,
  mockUriBad,
  mockUriSlowGood,
  mockUriSlowBad,
  mockResourceGood,
  mockResourceBad,
} from "../__fixtures__";
import { ResponsiveImageView, type ResponsiveImageViewBag } from "..";

const expectedShape = expect.objectContaining<ResponsiveImageViewBag>({
  loading: expect.any(Boolean) as ResponsiveImageViewBag["loading"],
  error: expect.any(String) as ResponsiveImageViewBag["error"],
  getViewProps: expect.any(Function) as ResponsiveImageViewBag["getViewProps"],
  getImageProps: expect.any(
    Function,
  ) as ResponsiveImageViewBag["getImageProps"],
  retry: expect.any(Function) as ResponsiveImageViewBag["retry"],
}) as ResponsiveImageViewBag;

describe("rendering order (component > render > FAC > children > null)", () => {
  describe("renders component if provided", () => {
    it("function", async () => {
      const MyFunctionComponent = jest.fn(() => <View />);
      const renderProp = jest.fn(() => <View />);
      const children = jest.fn(() => <View />);
      await render(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          component={MyFunctionComponent}
          render={renderProp}
        >
          {children}
        </ResponsiveImageView>,
      );
      // the second argument is the context (undefined in this case), which we don't care about
      expect(MyFunctionComponent).toHaveBeenCalledWith(
        expectedShape,
        undefined,
      );
      expect(renderProp).not.toHaveBeenCalled();
      expect(children).not.toHaveBeenCalled();
    });

    it("class", async () => {
      const classRenderMethod = jest.fn((_props) => <View />);
      class MyClassComponent extends React.Component {
        render() {
          return classRenderMethod(this.props);
        }
      }
      const renderProp = jest.fn(() => <View />);
      const children = jest.fn(() => <View />);
      await render(
        <ResponsiveImageView
          source={{ uri: mockUriGood }}
          component={MyClassComponent}
          render={renderProp}
        >
          {children}
        </ResponsiveImageView>,
      );
      expect(classRenderMethod).toHaveBeenCalledWith(expectedShape);
      expect(renderProp).not.toHaveBeenCalled();
      expect(children).not.toHaveBeenCalled();
    });
  });

  it("calls render if no component was provided", async () => {
    const renderProp = jest.fn(() => <View />);
    const children = jest.fn(() => <View />);
    await render(
      <ResponsiveImageView source={{ uri: mockUriGood }} render={renderProp}>
        {children}
      </ResponsiveImageView>,
    );
    expect(renderProp).toHaveBeenCalledWith(expectedShape);
    expect(children).not.toHaveBeenCalled();
  });

  it("calls children function if no component or render prop was provided", async () => {
    const children = jest.fn(() => <View />);
    await render(
      <ResponsiveImageView source={{ uri: mockUriGood }}>
        {children}
      </ResponsiveImageView>,
    );
    expect(children).toHaveBeenCalledWith(expectedShape);
  });

  it("renders children if no component, render prop, or FAC was provided", async () => {
    await render(
      <ResponsiveImageView source={{ uri: mockUriGood }}>
        <View>
          <Text>Hello from non-functional children!</Text>
        </View>
      </ResponsiveImageView>,
    );
    expect(screen.getByText(/Hello/i)).toBeTruthy();
  });

  it("renders null if no renderer was provided", async () => {
    await render(<ResponsiveImageView source={{ uri: mockUriGood }} />);
    expect(screen.queryByText(/.*/)).toBeNull();
  });
});

describe("completion callbacks", () => {
  it("doesn't throw on success if no onLoad was provided", async () => {
    await expect(
      render(<ResponsiveImageView source={{ uri: mockUriGood }} />),
    ).resolves.toBeDefined();
  });

  it("doesn't throw on failure if no onError was provided", async () => {
    await expect(
      render(<ResponsiveImageView source={{ uri: mockUriBad }} />),
    ).resolves.toBeDefined();
  });

  it("calls provided onLoad on URI success", async () => {
    const onLoad = jest.fn();
    const onError = jest.fn();
    await render(
      <ResponsiveImageView
        source={{ uri: mockUriGood }}
        onLoad={onLoad}
        onError={onError}
      />,
    );
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("calls provided onError on URI failure", async () => {
    const onLoad = jest.fn();
    const onError = jest.fn();
    await render(
      <ResponsiveImageView
        source={{ uri: mockUriBad }}
        onLoad={onLoad}
        onError={onError}
      />,
    );
    expect(onLoad).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.any(String));
  });

  it("calls provided onLoad on imported resource success", async () => {
    const onLoad = jest.fn();
    const onError = jest.fn();
    await render(
      <ResponsiveImageView
        source={mockResourceGood}
        onLoad={onLoad}
        onError={onError}
      />,
    );
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("calls provided onError on imported resource failure", async () => {
    const onLoad = jest.fn();
    const onError = jest.fn();
    await render(
      <ResponsiveImageView
        source={mockResourceBad}
        onLoad={onLoad}
        onError={onError}
      />,
    );
    expect(onLoad).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.any(String));
  });

  it("does not call onLoad on success after unmounting", async () => {
    jest.useFakeTimers();
    const onLoad = jest.fn();
    const onError = jest.fn();
    const { unmount } = await render(
      <ResponsiveImageView
        source={{ uri: mockUriSlowGood }}
        onLoad={onLoad}
        onError={onError}
      />,
    );
    await unmount();
    await act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onLoad).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("does not call onError on failure after unmounting", async () => {
    jest.useFakeTimers();
    const onLoad = jest.fn();
    const onError = jest.fn();
    const { unmount } = await render(
      <ResponsiveImageView
        source={{ uri: mockUriSlowBad }}
        onLoad={onLoad}
        onError={onError}
      />,
    );
    await unmount();
    await act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onLoad).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});
