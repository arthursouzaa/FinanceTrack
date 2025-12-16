import React from 'react';

function NavbarItem({ render, ...props }) {
  if (render) {
    return (
      <li className='nav-item dropdown'>
        <a onClick={props.onClick} className='nav-link dropdown-toggle' href={props.href} role="button" data-bs-toggle="dropdown" aria-expanded="false">
          {props.label}
        </a>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item" href={props.link1}>{props.link1label}</a></li>
            <li><a class="dropdown-item" href={props.link2}>{props.link2label}</a></li>
        </ul>
      </li>
    );
  } else {
    return false;
  }
}

export default NavbarItem;
