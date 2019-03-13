import React from 'react';
import PropTypes from 'prop-types';
import useResponsiveImageView from './useResponsiveImageView';

function ResponsiveImageView({
  component: ComponentOrFunction,
  render,
  children,
  aspectRatio,
  source,
  onLoad,
  onError,
}) {
  const bag = useResponsiveImageView({ aspectRatio, source, onLoad, onError });

  // component injection
  if (ComponentOrFunction) {
    // class component
    if (ComponentOrFunction.prototype.render) {
      return <ComponentOrFunction {...bag} />;
    }

    // function component
    return ComponentOrFunction(bag);
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
    return React.Children.only(children);
  }

  return null;
}

ResponsiveImageView.displayName = 'ResponsiveImageView';

ResponsiveImageView.propTypes = {
  aspectRatio: PropTypes.number,
  component: PropTypes.func,
  render: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  onError: PropTypes.func,
  onLoad: PropTypes.func,
  source: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      uri: PropTypes.string.isRequired,
    }),
  ]).isRequired,
};

ResponsiveImageView.defaultProps = {
  aspectRatio: undefined,
  component: undefined,
  render: undefined,
  children: undefined,
  onError: () => {},
  onLoad: () => {},
};

export { useResponsiveImageView };
export default ResponsiveImageView;
