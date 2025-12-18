import React from 'react';

class Card extends React.Component {
  render() {
    return (
      <div className='card md-3 mw-100' style={this.props.style}>
        <h3 className='card-header'>
          <i className={this.props.icon}></i>
          {this.props.title}
        </h3>
        <div className='card-body'>{this.props.children}</div>
      </div>
    );
  }
}

export default Card;
