import * as React from 'react';
import { useResponsiveImageView, type ResponsiveImageViewProps } from './useResponsiveImageView';

function defaultOnLoad() {}
function defaultOnError(_: string) {}

function isFunctionComponent(
  component: React.ComponentType | React.FunctionComponent,
): component is React.FunctionComponent {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return !component.prototype?.isReactComponent;
}

function ResponsiveImageView({
  component: Component = undefined,
  render = undefined,
  children = undefined,
  aspectRatio = undefined,
  source,
  onLoad = defaultOnLoad,
  onError = defaultOnError,
}: ResponsiveImageViewProps): React.ReactElement<ResponsiveImageViewProps> | null {
  const bag = useResponsiveImageView({ aspectRatio, source, onLoad, onError });

  // component injection
  if (Component) {
    // function component
    if (isFunctionComponent(Component)) {
      // casting to synchronous as RN doesn't support async function components (RSC)
      return Component(bag) as React.ReactElement<ResponsiveImageViewProps>;
    }

    // class component
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

export { useResponsiveImageView };
export default ResponsiveImageView;
