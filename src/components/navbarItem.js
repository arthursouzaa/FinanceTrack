import React from 'react';

function NavbarItem({ render, ...props }) {
  if (render) {
    return (
      <li className='nav-item'>
        <a onClick={props.onClick} className='nav-link' href={props.href}>
          <i className={props.icon}></i>&nbsp;
          {props.label}
        </a>
      </li>
    );
  } else {
    return false;
  }
}

export default NavbarItem;