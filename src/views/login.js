import React, { useState } from 'react';
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
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = () => {
    if (!email || !senha) {
      mensagemErro('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setCarregando(true);

    axios
      .post(`${BASE_URL}/clientes/auth`, { email, senha })
      .then((response) => {

        const dadosAutenticacao = response.data;

        if (dadosAutenticacao.token) {
          localStorage.setItem('_financetrack_token', dadosAutenticacao.token);
          salvarUsuarioLogado(dadosAutenticacao);
          mensagemSucesso(`Bem-vindo, ${dadosAutenticacao.nome || 'Usuário'}!`);
          navigate('/');
        } else {
          mensagemErro('Erro inesperado na resposta do servidor.');
        }
      })
      .catch((error) => {
        console.error('Erro ao fazer login:', error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          mensagemErro('E-mail ou senha incorretos.');
        } else {
          mensagemErro('Erro ao tentar se conectar ao servidor.');
        }
      })
      .finally(() => {
        setCarregando(false);
      });
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

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <FormGroup label="E-mail:" htmlFor="email">
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={carregando}
                />
              </FormGroup>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <FormGroup label="Senha:" htmlFor="senha">
                <input
                  type="password"
                  id="senha"
                  className="form-control"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={carregando}
                />
              </FormGroup>
            </div>

            <div className="d-flex gap-2" style={{ marginTop: '20px' }}>
              <button
                onClick={handleLogin}
                className="btn btn-success flex-grow-1"
                disabled={carregando}
              >
                {carregando ? 'Autenticando...' : 'Entrar'}
              </button>
              <button
                onClick={() => {
                  setEmail('');
                  setSenha('');
                }}
                className="btn btn-secondary"
                disabled={carregando}
              >
                Limpar
              </button>
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
}

export default Login;