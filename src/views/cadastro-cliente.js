import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config/axios';
import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import logo from '../assets/financetrack-logocolorida.png';
import '../custom.css';
import { salvarUsuarioLogado } from '../utils/usuarioLogado';

function CadastroCliente() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirmada, setSenhaConfirmada] = useState('');
  const [carregando, setCarregando] = useState(false);

  const senhaTemMinimo = senha.length >= 8;
  const senhaTemMaiuscula = /[A-Z]/.test(senha);
  const senhaTemMinuscula = /[a-z]/.test(senha);
  const senhaTemNumero = /[0-9]/.test(senha);

  function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);

    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }

    return numeros.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }

  function validarCampos() {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefoneSomenteNumeros = telefone.replace(/\D/g, '');

    if (!nome || nome.trim() === '') {
      mensagemErro('Por favor, preencha o campo obrigatório: Nome (*)');
      return false;
    }

    if (nome.trim().length < 3) {
      mensagemErro('O nome deve ter pelo menos 3 caracteres.');
      return false;
    }

    if (!email || email.trim() === '') {
      mensagemErro('Por favor, preencha o campo obrigatório: E-mail (*)');
      return false;
    }

    if (!emailValido.test(email)) {
      mensagemErro('Informe um e-mail válido.');
      return false;
    }

    if (!telefone || telefoneSomenteNumeros.length !== 10 && telefoneSomenteNumeros.length !== 11) {
      mensagemErro('Informe um telefone válido com DDD.');
      return false;
    }

    if (!senha) {
      mensagemErro('Por favor, preencha o campo obrigatório: Senha (*)');
      return false;
    }

    if (!senhaTemMinimo || !senhaTemMaiuscula || !senhaTemMinuscula || !senhaTemNumero) {
      mensagemErro('A senha não atende aos requisitos mínimos.');
      return false;
    }

    if (!senhaConfirmada) {
      mensagemErro('Por favor, confirme sua senha.');
      return false;
    }

    if (senha !== senhaConfirmada) {
      mensagemErro('As senhas não coincidem.');
      return false;
    }

    return true;
  }

  function salvar() {
    if (!validarCampos()) {
      return;
    }

    setCarregando(true);

    const cliente = {
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.replace(/\D/g, ''),
      senha,
      senhaConfirmada
    };

    axios.post(`${BASE_URL}/clientes`, cliente)
      .then(() => {
        return axios.post(`${BASE_URL}/clientes/login`, {
            email: email.trim(),
            senha: senha
        });
      })
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
        console.error('Erro ao cadastrar cliente:', error);

        if (error.response && error.response.data && error.response.data.message) {
          mensagemErro(error.response.data.message);
        } else {
          mensagemErro('Erro ao criar conta. Verifique os dados informados.');
        }
      })
      .finally(() => {
        setCarregando(false);
      });
  }

  return (
    <div className="cadastro-cliente-container">
      <div className="cadastro-cliente-card-wrapper">
          <Card title="Criar conta">
            <div className="text-center cadastro-cliente-topo">
                <img
                src={logo}
                alt="FinanceTrack"
                className="cadastro-cliente-logo"
                />
                <p className="cadastro-cliente-subtitulo">
                Preencha os dados abaixo para se cadastrar
                </p>
            </div>

            <div className="row cadastro-cliente-formulario">
                <div className="col-md-6">
                <FormGroup label="Nome completo *" htmlFor="nome">
                    <input
                    type="text"
                    id="nome"
                    className="form-control"
                    placeholder="Digite seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={carregando}
                    />
                </FormGroup>
                </div>

                <div className="col-md-6">
                <FormGroup label="E-mail *" htmlFor="email">
                    <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="Digite seu melhor e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={carregando}
                    />
                </FormGroup>
                </div>

                <div className="col-md-6">
                <FormGroup label="Telefone *" htmlFor="telefone">
                    <input
                    type="text"
                    id="telefone"
                    className="form-control"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                    disabled={carregando}
                    />
                </FormGroup>
                </div>

                <div className="col-md-6">
                <FormGroup label="Senha *" htmlFor="senha">
                    <input
                    type="password"
                    id="senha"
                    className="form-control"
                    placeholder="Crie uma senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={carregando}
                    />
                </FormGroup>
                </div>

                {senha.length > 0 && (
                <div className="col-12">
                    <div className="cadastro-cliente-requisitos">
                    <p>A senha deve conter:</p>

                    <div className="cadastro-cliente-requisitos-grid">
                        <span className={senhaTemMinimo ? 'requisito-ok' : 'requisito-pendente'}>
                        ✓ Pelo menos 8 caracteres
                        </span>

                        <span className={senhaTemMaiuscula ? 'requisito-ok' : 'requisito-pendente'}>
                        ✓ Uma letra maiúscula
                        </span>

                        <span className={senhaTemMinuscula ? 'requisito-ok' : 'requisito-pendente'}>
                        ✓ Uma letra minúscula
                        </span>

                        <span className={senhaTemNumero ? 'requisito-ok' : 'requisito-pendente'}>
                        ✓ Um número
                        </span>
                    </div>
                    </div>
                </div>
                )}

                <div className="col-md-6">
                <FormGroup label="Confirmar senha *" htmlFor="senhaConfirmada">
                    <input
                    type="password"
                    id="senhaConfirmada"
                    className="form-control"
                    placeholder="Confirme sua senha"
                    value={senhaConfirmada}
                    onChange={(e) => setSenhaConfirmada(e.target.value)}
                    disabled={carregando}
                    />
                </FormGroup>
                </div>

                <div className="col-md-6 d-flex align-items-end">
                <button
                    onClick={salvar}
                    className="btn btn-success w-100 cadastro-cliente-botao"
                    disabled={carregando}
                >
                    {carregando ? 'Criando conta...' : 'Criar conta'}
                </button>
                </div>
            </div>

            <div className="cadastro-cliente-login">
                Já possui uma conta?{' '}
                <span onClick={() => navigate('/login')}>
                LOGIN
                </span>
            </div>
            </Card>
        </div>
    </div>
    );
}

export default CadastroCliente;