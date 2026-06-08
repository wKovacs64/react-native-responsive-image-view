import * as React from "react";
import { render, act } from "@testing-library/react-native";
import {
  mockUriGood,
  mockUriBad,
  mockUriSlowGood,
  mockUriSlowBad,
  mockResourceGood,
  mockResourceBad,
  computedAspectRatio,
  controlledAspectRatio,
  consumerViewProps,
  consumerImageProps,
} from "../__fixtures__";
import { useResponsiveImageView, type UseResponsiveImageViewOptions } from "..";

function objectKeys<Obj extends object>(obj: Obj): (keyof Obj)[] {
  return Object.keys(obj) as (keyof Obj)[];
}

function Comp({
  children,
  ...props
}: { children: React.FunctionComponent } & UseResponsiveImageViewOptions) {
  return children(useResponsiveImageView(props));
}

const renderHook = async (props: UseResponsiveImageViewOptions) => {
  const children = jest.fn(() => null);
  return { children, ...(await render(<Comp {...props}>{children}</Comp>)) };
};

describe("parameter validation", () => {
  it("requires a source", async () => {
    // @ts-expect-error: source is required but we're testing its omission
    await expect(renderHook({})).rejects.toThrow(/source/);
  });

  it("requires a valid source", async () => {
    await expect(renderHook({ source: {} })).rejects.toThrow(/source/);
  });
});

describe("loading", () => {
  it("is true while loading and otherwise false", async () => {
    const { children } = await renderHook({ source: { uri: mockUriGood } });
    expect(children).toHaveBeenCalledWith(
      expect.objectContaining({ loading: true }),
    );
    expect(children).toHaveBeenCalledWith(
      expect.objectContaining({ loading: false }),
    );
  });
});

describe("error", () => {
  it("contains an error message on failure", async () => {
    const { children } = await renderHook({ source: { uri: mockUriBad } });
    expect(children).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) as string }),
    );
    // @ts-expect-error accessing untyped mock call args
    expect(children.mock.calls[1][0].error).not.toHaveLength(0);
  });

  it("is empty on success", async () => {
    const { children } = await renderHook({ source: { uri: mockUriGood } });
    expect(children).toHaveBeenCalledWith(
      expect.objectContaining({ error: "" }),
    );
  });
});

type Bags = ReturnType<typeof useResponsiveImageView>[];

describe("retry", () => {
  it("retries", async () => {
    const { children } = await renderHook({ source: { uri: mockUriBad } });
    const { retry } = (children.mock.calls[1] as Bags)[0];
    expect((children.mock.calls[1] as Bags)[0].loading).toBe(false);
    await act(() => {
      retry();
    });
    expect((children.mock.calls[2] as Bags)[0].loading).toBe(true);
    expect((children.mock.calls[3] as Bags)[0].loading).toBe(false);
  });
});

describe("getViewProps", () => {
  it("includes controlled aspectRatio", async () => {
    const { children } = await renderHook({
      aspectRatio: controlledAspectRatio,
      source: { uri: mockUriGood },
    });
    const { getViewProps } = (children.mock.calls[1] as Bags)[0];
    expect(getViewProps().style).toContainEqual({
      aspectRatio: controlledAspectRatio,
    });
  });

  it("includes calculated aspectRatio if not provided", async () => {
    const { children } = await renderHook({ source: { uri: mockUriGood } });
    const { getViewProps } = (children.mock.calls[1] as Bags)[0];
    expect(getViewProps().style).toContainEqual({
      aspectRatio: computedAspectRatio,
    });
  });

  it("composes consumer props with own props", async () => {
    expect.assertions(objectKeys(consumerViewProps).length);
    const { children } = await renderHook({ source: { uri: mockUriGood } });
    const { getViewProps } = (children.mock.calls[1] as Bags)[0];
    const mergedProps = getViewProps(consumerViewProps);
    objectKeys(consumerViewProps).forEach((consumerProp) => {
      expect(mergedProps[consumerProp]).toMatchSnapshot(consumerProp);
    });
  });
});

describe("getImageProps", () => {
  it("sets height and width to 100%", async () => {
    const { children } = await renderHook({ source: { uri: mockUriGood } });
    const { getImageProps } = (children.mock.calls[1] as Bags)[0];
    expect(getImageProps().style).toContainEqual({
      height: "100%",
      width: "100%",
    });
  });

  it("composes consumer props with own props", async () => {
    expect.assertions(objectKeys(consumerImageProps).length);
    const { children } = await renderHook({ source: { uri: mockUriGood } });
    const { getImageProps } = (children.mock.calls[1] as Bags)[0];
    const mergedProps = getImageProps(consumerImageProps);
    objectKeys(consumerImageProps).forEach((consumerProp) => {
      expect(mergedProps[consumerProp]).toMatchSnapshot(consumerProp);
    });
  });
});

describe("completion callbacks", () => {
  const onLoad = jest.fn();
  const onError = jest.fn();

  it("doesn't throw on success if no onLoad was provided", async () => {
    await expect(
      renderHook({ source: { uri: mockUriGood } }),
    ).resolves.toBeDefined();
  });

  it("doesn't throw on failure if no onError was provided", async () => {
    await expect(
      renderHook({ source: { uri: mockUriBad } }),
    ).resolves.toBeDefined();
  });

  it("calls provided onLoad on URI success", async () => {
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    await renderHook({ source: { uri: mockUriGood }, onLoad, onError });
    expect(onError).toHaveBeenCalledTimes(0);
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it("calls provided onError on URI failure", async () => {
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    await renderHook({ source: { uri: mockUriBad }, onLoad, onError });
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(String));
  });

  it("calls provided onLoad on imported resource success", async () => {
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    await renderHook({ source: mockResourceGood, onLoad, onError });
    expect(onError).toHaveBeenCalledTimes(0);
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it("calls provided onError on imported resource failure", async () => {
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    await renderHook({ source: mockResourceBad, onLoad, onError });
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(String));
  });

  it("does not call onLoad on success after unmounting", async () => {
    jest.useFakeTimers();
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    const { unmount } = await renderHook({
      source: { uri: mockUriSlowGood },
      onLoad,
      onError,
    });
    await unmount();
    await act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onError).toHaveBeenCalledTimes(0);
    expect(onLoad).toHaveBeenCalledTimes(0);
    jest.useRealTimers();
  });

  it("does not call onError on failure after unmounting", async () => {
    jest.useFakeTimers();
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    const { unmount } = await renderHook({
      source: { uri: mockUriSlowBad },
      onLoad,
      onError,
    });
    await unmount();
    await act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onError).toHaveBeenCalledTimes(0);
    expect(onLoad).toHaveBeenCalledTimes(0);
    jest.useRealTimers();
  });
});
