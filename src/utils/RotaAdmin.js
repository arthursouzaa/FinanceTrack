import React from 'react';
import { Navigate } from 'react-router-dom';
import { obterUsuarioLogado } from './usuarioLogado';

export function RotaAdmin({ element }) {
  const usuarioLogado = obterUsuarioLogado();

  // Se não estiver logado, manda pro login
  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado mas NÃO for admin, manda pra tela de acesso negado
  if (usuarioLogado.admin !== true) {
    return <Navigate to="/acesso-negado" replace />;
  }

  // Se for admin, renderiza o componente solicitado
  return element;
}