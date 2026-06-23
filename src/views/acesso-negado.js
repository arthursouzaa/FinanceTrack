import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/card'; // Aproveitando seu componente de Card

function AcessoNegado() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <Card title="Acesso Restrito" icon="bi bi-shield-lock-fill">
        <div className="text-center p-4">
          <h2 className="text-danger">Acesso Negado!</h2>
          <p className="lead mt-3">
            Você não tem permissão para acessar esta página.
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

export default AcessoNegado;