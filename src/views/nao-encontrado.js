import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/card';

function NaoEncontrado() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <Card title="Página Não Encontrada" icon="bi bi-exclamation-triangle-fill">
        <div className="text-center p-4">
          <h2 className="text-warning">Ops! Nada por aqui.</h2>
          <p className="lead mt-3">
            A página que você tentou acessar não existe.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary mt-4"
          >
            <i className="bi bi-house me-2"></i>
            Voltar para o Início
          </button>
        </div>
      </Card>
    </div>
  );
}

export default NaoEncontrado;