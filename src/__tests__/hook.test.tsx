import * as React from 'react';
import { render, act } from '@testing-library/react-native';
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
} from '../__fixtures__';
import { useResponsiveImageView, type UseResponsiveImageViewOptions } from '..';

function objectKeys<Obj extends object>(obj: Obj): (keyof Obj)[] {
  return Object.keys(obj) as (keyof Obj)[];
}

function Comp({
  children,
  ...props
}: { children: React.FunctionComponent } & UseResponsiveImageViewOptions) {
  return children(useResponsiveImageView(props));
}

const renderHook = (props: UseResponsiveImageViewOptions) => {
  const children = jest.fn(() => null);
  return { children, ...render(<Comp {...props}>{children}</Comp>) };
};

describe('parameter validation', () => {
  it('requires a source', () => {
    // @ts-expect-error: source is required but we're testing its omission
    expect(() => renderHook({})).toThrow(/source/);
  });

  it('requires a valid source', () => {
    expect(() => renderHook({ source: {} })).toThrow(/source/);
  });
});

describe('loading', () => {
  it('is true while loading and otherwise false', () => {
    const { children } = renderHook({ source: { uri: mockUriGood } });
    expect(children).toHaveBeenCalledWith(expect.objectContaining({ loading: true }));
    expect(children).toHaveBeenCalledWith(expect.objectContaining({ loading: false }));
  });
});

describe('error', () => {
  it('contains an error message on failure', () => {
    const { children } = renderHook({ source: { uri: mockUriBad } });
    expect(children).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) as string }),
    );
    // @ts-expect-error
    expect(children.mock.calls[1][0].error).not.toHaveLength(0);
  });

  it('is empty on success', () => {
    const { children } = renderHook({ source: { uri: mockUriGood } });
    expect(children).toHaveBeenCalledWith(expect.objectContaining({ error: '' }));
  });
});

type Bags = ReturnType<typeof useResponsiveImageView>[];

describe('retry', () => {
  it('retries', async () => {
    const { children } = renderHook({ source: { uri: mockUriBad } });
    const { retry } = (children.mock.calls[1] as Bags)[0];
    expect((children.mock.calls[1] as Bags)[0].loading).toBe(false);
    act(() => {
      retry();
    });
    expect((children.mock.calls[2] as Bags)[0].loading).toBe(true);
    expect((children.mock.calls[3] as Bags)[0].loading).toBe(false);
  });
});

describe('getViewProps', () => {
  it('includes controlled aspectRatio', () => {
    const { children } = renderHook({
      aspectRatio: controlledAspectRatio,
      source: { uri: mockUriGood },
    });
    const { getViewProps } = (children.mock.calls[1] as Bags)[0];
    expect(getViewProps().style).toContainEqual({ aspectRatio: controlledAspectRatio });
  });

  it('includes calculated aspectRatio if not provided', () => {
    const { children } = renderHook({ source: { uri: mockUriGood } });
    const { getViewProps } = (children.mock.calls[1] as Bags)[0];
    expect(getViewProps().style).toContainEqual({ aspectRatio: computedAspectRatio });
  });

  it('composes consumer props with own props', () => {
    expect.assertions(objectKeys(consumerViewProps).length);
    const { children } = renderHook({ source: { uri: mockUriGood } });
    const { getViewProps } = (children.mock.calls[1] as Bags)[0];
    const mergedProps = getViewProps(consumerViewProps);
    objectKeys(consumerViewProps).forEach((consumerProp) => {
      expect(mergedProps[consumerProp]).toMatchSnapshot(consumerProp);
    });
  });
});

describe('getImageProps', () => {
  it('sets height and width to 100%', () => {
    const { children } = renderHook({ source: { uri: mockUriGood } });
    const { getImageProps } = (children.mock.calls[1] as Bags)[0];
    expect(getImageProps().style).toContainEqual({ height: '100%', width: '100%' });
  });

  it('composes consumer props with own props', () => {
    expect.assertions(objectKeys(consumerImageProps).length);
    const { children } = renderHook({ source: { uri: mockUriGood } });
    const { getImageProps } = (children.mock.calls[1] as Bags)[0];
    const mergedProps = getImageProps(consumerImageProps);
    objectKeys(consumerImageProps).forEach((consumerProp) => {
      expect(mergedProps[consumerProp]).toMatchSnapshot(consumerProp);
    });
  });
});

describe('completion callbacks', () => {
  const onLoad = jest.fn();
  const onError = jest.fn();

  it("doesn't throw on success if no onLoad was provided", () => {
    expect(() => renderHook({ source: { uri: mockUriGood } })).not.toThrow();
  });

  it("doesn't throw on failure if no onError was provided", () => {
    expect(() => renderHook({ source: { uri: mockUriBad } })).not.toThrow();
  });

  it('calls provided onLoad on URI success', () => {
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    renderHook({ source: { uri: mockUriGood }, onLoad, onError });
    expect(onError).toHaveBeenCalledTimes(0);
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('calls provided onError on URI failure', () => {
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    renderHook({ source: { uri: mockUriBad }, onLoad, onError });
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(String));
  });

  it('calls provided onLoad on imported resource success', () => {
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    renderHook({ source: mockResourceGood, onLoad, onError });
    expect(onError).toHaveBeenCalledTimes(0);
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('calls provided onError on imported resource failure', () => {
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    renderHook({ source: mockResourceBad, onLoad, onError });
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(String));
  });

  it('does not call onLoad on success after unmounting', () => {
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    const { unmount } = renderHook({ source: { uri: mockUriSlowGood }, onLoad, onError });
    unmount();
    expect(onError).toHaveBeenCalledTimes(0);
    expect(onLoad).toHaveBeenCalledTimes(0);
  });

  it('does not call onError on failure after unmounting', () => {
    expect(onLoad).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
    const { unmount } = renderHook({ source: { uri: mockUriSlowBad }, onLoad, onError });
    unmount();
    expect(onError).toHaveBeenCalledTimes(0);
    expect(onLoad).toHaveBeenCalledTimes(0);
  });
});
