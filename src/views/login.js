import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config/axios';
import { salvarUsuarioLogado } from '../utils/usuarioLogado';
import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import '../custom.css';

function Login() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Carregar lista de clientes
    axios
      .get(`${BASE_URL}/clientes`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setClientes(response.data);
        }
        setCarregando(false);
      })
      .catch((error) => {
        mensagemErro('Erro ao carregar clientes');
        setCarregando(false);
      });
  }, []);

  const handleLogin = () => {
    if (!clienteSelecionado) {
      mensagemErro('Selecione um cliente para entrar');
      return;
    }

    // Encontrar o cliente selecionado
    const cliente = clientes.find((c) => String(c.id) === String(clienteSelecionado));

    if (cliente) {
      // Salvar na localStorage
      salvarUsuarioLogado(cliente);
      mensagemSucesso(`Bem-vindo, ${cliente.nome}!`);
      navigate('/');
    } else {
      mensagemErro('Cliente não encontrado');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="container" style={{ marginTop: '50px', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-lg-5">
          <Card title="Acesso ao FinanceTrack">
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <FormGroup
                label="Selecione um Cliente:"
                htmlFor="clienteSelecionado"
              >
                <select
                  id="clienteSelecionado"
                  className="form-control"
                  value={clienteSelecionado}
                  onChange={(e) => setClienteSelecionado(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={carregando}
                >
                  <option value="">-- Selecione um cliente --</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome} (ID: {cliente.id})
                    </option>
                  ))}
                </select>
              </FormGroup>
            </div>

            <div className="d-flex gap-2" style={{ marginTop: '20px' }}>
              <button
                onClick={handleLogin}
                className="btn btn-success flex-grow-1"
                disabled={carregando}
              >
                {carregando ? 'Carregando...' : 'Entrar'}
              </button>
              <button
                onClick={() => setClienteSelecionado('')}
                className="btn btn-secondary"
                disabled={carregando}
              >
                Limpar
              </button>
            </div>

            {carregando && (
              <p className="text-center mt-3">Carregando clientes...</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Login;
