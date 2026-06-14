import React from 'react';
import { Navigate } from 'react-router-dom';
import { obterUsuarioLogado } from './usuarioLogado';

export function RotaProtegida({ element }) {
  const usuarioAutenticado = obterUsuarioLogado();

  return usuarioAutenticado ? element : <Navigate to="/login" replace />;
}