import React from 'react';

function NavbarItem({ render, links = [], ...props }) {
  if (!render) {
    return null;
  }

  return (
    <li className="nav-item dropdown">
      <a
        onClick={props.onClick}
        className="nav-link dropdown-toggle"
        href={props.href}
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className={props.icon}></i>&nbsp;
        {props.label}
      </a>

      <ul className="dropdown-menu">
        {links.map((link, index) => (
          <li key={index}>
            <a className="dropdown-item" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default NavbarItem;