import React from 'react';

function btnEdicao({ render, ...props }) {
  if (render) {
    return (
      <a onClick={props.onClick} className='edicao' href={props.href}>
        {props.label}
      </a>
    );
  } else {
    return false;
  }
}

export default btnEdicao;