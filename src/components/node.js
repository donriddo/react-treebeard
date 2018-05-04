'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { VelocityTransitionGroup } from 'velocity-react';

import NodeHeader from './header';

class TreeNode extends React.Component {
  constructor() {
    super();

    this.onClick = this.onClick.bind(this);
    this.onToggle = this.onToggle.bind(this);
  }

  onClick(e) {
    const { node, onClick } = this.props;

    if (onClick) {
      onClick(e, node);
    }
  }

  onContextMenu(e) {
    const { node, onContextMenu } = this.props;

    if (onContextMenu) {
      onContextMenu(e, node);
    }
  }

  onToggle() {
    const { node, onToggle } = this.props;
    const { toggled } = node;

    if (onToggle) {
      onToggle(node, !toggled);
    }
  }

  animations() {
    const { animations, node } = this.props;

    if (animations === false) {
      return false;
    }

    const anim = Object.assign({}, animations, node.animations);
    return {
      toggle: anim.toggle(this.props),
      drawer: anim.drawer(this.props)
    };
  }

  decorators() {
    // Merge Any Node Based Decorators Into The Pack
    const { decorators, node } = this.props;
    let nodeDecorators = node.decorators || {};

    return Object.assign({}, decorators, nodeDecorators);
  }

  render() {
    const { style } = this.props;
    const decorators = this.decorators();
    const animations = this.animations();

    return (
      <li ref={ref => this.topLevelRef = ref}
        style={style.base}>
        {this.renderHeader(decorators, animations)}

        {this.renderDrawer(decorators, animations)}
      </li>
    );
  }

  renderDrawer(decorators, animations) {
    const { node: { toggled } } = this.props;

    if (!animations && !toggled) {
      return null;
    } else if (!animations && toggled) {
      return this.renderChildren(decorators, animations);
    }

    const { animation, duration, ...restAnimationInfo } = animations.drawer;
    return (
      <VelocityTransitionGroup {...restAnimationInfo}
        ref={ref => this.velocityRef = ref}>
        {toggled ? this.renderChildren(decorators, animations) : null}
      </VelocityTransitionGroup>
    );
  }

  renderHeader(decorators, animations) {
    const { node, style } = this.props;

    return (
      <NodeHeader animations={animations}
        decorators={decorators}
        node={Object.assign({}, node)}
        onClick={this.onClick}
        onToggle={this.onToggle}
        onContextMenu={this.onContextMenu}
        style={style}
        customProps={this.props.customProps}
      />
    );
  }

  renderChildren(decorators) {
    const { animations, decorators: propDecorators, node, style } = this.props;

    if (node.loading) {
      return this.renderLoading(decorators);
    }

    let children = node.children;
    if (!Array.isArray(children)) {
      children = children ? [children] : [];
    }

    return (
      <ul style={style.subtree}
        ref={ref => this.subtreeRef = ref}>
        {children.map((child, index) => <TreeNode {...this._eventBubbles()}
          animations={animations}
          decorators={propDecorators}
          key={child.id || index}
          node={child}
          style={style}
          customProps={this.props.customProps}
        />
        )}
      </ul>
    );
  }

  renderLoading(decorators) {
    const { style } = this.props;

    return (
      <ul style={style.subtree}>
        <li>
          <decorators.Loading style={style.loading} />
        </li>
      </ul>
    );
  }

  _eventBubbles() {
    const { onToggle, onClick, onContextMenu } = this.props;

    return {
      onToggle,
      onClick,
      onContextMenu
    };
  }
}

TreeNode.propTypes = {
  style: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  decorators: PropTypes.object.isRequired,
  animations: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool
  ]).isRequired,
  onToggle: PropTypes.func,
  onClick: PropTypes.func,
  onContextMenu: PropTypes.func
};

export default TreeNode;
