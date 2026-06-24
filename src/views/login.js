import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config/axios';
import { salvarUsuarioLogado } from '../utils/usuarioLogado';
import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import logo from '../assets/financetrack-logocolorida.png';
import '../custom.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = () => {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || email.trim() === '' || !senha || senha.trim() === '') {
      mensagemErro('Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (!emailValido.test(email)) {
      mensagemErro('Informe um e-mail válido.');
      return;
    }

    setCarregando(true);

    axios
      .post(`${BASE_URL}/clientes/auth`, {
        email: email.trim(),
        senha
      })
      .then((response) => {
        const dadosAutenticacao = response.data;

        if (dadosAutenticacao.token) {
          localStorage.setItem(
            '_financetrack_token',
            dadosAutenticacao.token
          );

          salvarUsuarioLogado(dadosAutenticacao);

          mensagemSucesso('Seja bem-vindo(a) ao FinanceTrack!');

          navigate('/home'); // ou '/' se sua home continuar nessa rota
        } else {
          mensagemErro('Erro inesperado na resposta do servidor.');
        }
      })
      .catch((error) => {
        console.error('Erro ao fazer login:', error);

        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.status === 403)
        ) {
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
    <div className="login-container">
      <div className="login-card-wrapper">
        <Card title="Login">
          <div className="text-center login-topo">
            <img
              src={logo}
              alt="FinanceTrack"
              className="login-logo"
            />

            <p className="login-subtitulo">
              Acesse sua conta para continuar
            </p>
          </div>

          <FormGroup label="E-mail *" htmlFor="email">
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

          <FormGroup label="Senha *" htmlFor="senha">
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

          <button
            onClick={handleLogin}
            className="btn btn-success w-100 login-botao"
            disabled={carregando}
          >
            {carregando ? 'Autenticando...' : 'Login'}
          </button>

          {/* <div className="login-cadastro">
            Não possui uma conta?{' '}
            <span onClick={() => navigate('/cadastro-cliente')}>
              CADASTRE-SE
            </span>
          </div> */}
        </Card>
      </div>
    </div>
  );
}

export default Login;