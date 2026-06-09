import React from 'react';
import { Navigate } from 'react-router-dom';
import { obterIdUsuarioLogado } from './usuarioLogado';

export function RotaProtegida({ element }) {
  const idUsuarioLogado = obterIdUsuarioLogado();

  if (!idUsuarioLogado) {
    return <Navigate to="/login" />;
  }

  return element;
}
