import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios'; 
import BtnEdicao from '../components/btnEdicao';
import "../styles/home.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { filtrarRegistrosDoUsuario, obterIdUsuarioLogado, obterUsuarioLogado } from '../utils/usuarioLogado';
import { mensagemErro } from '../components/toastr';

function Home() {
    const navigate = useNavigate();
    const [totalReceitas, setTotalReceitas] = useState(0);
    const [totalDespesas, setTotalDespesas] = useState(0);
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [idUsuario, setIdUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarDados() {
            try {
                const usuarioLogado = obterUsuarioLogado();
                const idUsuarioAtual = obterIdUsuarioLogado();

                if (!idUsuarioAtual) {
                    navigate('/login');
                    return;
                }

                setIdUsuario(idUsuarioAtual);

                const [receitasRes, despesasRes, clienteRes] = await Promise.all([
                    api.get('/receitas'),
                    api.get('/despesas'),
                    api.get(`/clientes/${idUsuarioAtual}`)
                ]);

                const soma = (lista) =>
                    lista.reduce((acc, item) => acc + Number(item.valor || 0), 0);

                const receitasDoUsuario = filtrarRegistrosDoUsuario(receitasRes.data, idUsuarioAtual);
                const despesasDoUsuario = filtrarRegistrosDoUsuario(despesasRes.data, idUsuarioAtual);

                setTotalReceitas(soma(receitasDoUsuario));
                setTotalDespesas(soma(despesasDoUsuario));
                setNomeUsuario(clienteRes.data?.nome ?? usuarioLogado?.nome ?? 'Usuário');
            } catch (error) {
                console.error('Erro ao carregar dados da Home:', error);
                
                if (error.response?.status === 401 || error.response?.status === 403) {
                    mensagemErro('Sessão expirada. Por favor, faça login novamente.');
                    navigate('/login');
                } else {
                    mensagemErro('Erro ao carregar dados do painel, verifique sua conexão.');
                }
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, [navigate]);

    if (carregando) {
        return (
            <div className="container text-center mt-5">
                <p>Carregando painel financeiro...</p>
            </div>
        );
    }

    return (
        <div className="container text-center">
            <img src={require('../assets/financetrack-slogan.png')} alt="FinanceTrack Slogan" style={{ maxWidth: '50%' }} />

            <div id="dados-pessoais">
                <div className="perfil" style={{ padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <i className="bi bi-person-circle" style={{ fontSize: 70, marginBottom: -10 }}></i>
                    <span className="nome-usuario" style={{ margin: 0 }}>
                        {nomeUsuario ? nomeUsuario.split(' ')[0] : 'Usuário'}
                    </span>
                </div>

                <div className="conteudo">
                    <h3>Seja bem-vindo(a), {nomeUsuario}!</h3>
                    <p>
                        Na página inicial você encontra o seu saldo total. Além disso, você pode
                        editar seus dados pessoais, suas categorias de entrada/saída e formas de pagamento! 🎉
                    </p>
                    <div className="botoes">
                        <BtnEdicao render='true' href={idUsuario ? `/listagem-perfil/${idUsuario}` : '/listagem-perfil'} label='Editar Perfil ' />
                        <BtnEdicao render='true' href='/listagem-categorias' label='Editar Categorias ' />
                        <BtnEdicao render='true' href='/listagem-formasPagamento' label='Editar Formas de Pagamento ' />
                    </div>
                </div>
            </div>

            <div className="row mt-4 justify-content-center">
                <div className="col-md-3">
                    <div className="resumo-box">
                        <h6>Saldo Total</h6>
                        <h4 className="saldo">
                            {(totalReceitas - totalDespesas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h4>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="resumo-box">
                        <h6>Entradas</h6>
                        <h4 className="entrada">
                            {totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            <i className="bi bi-caret-up-fill ms-1"></i>
                        </h4>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="resumo-box">
                        <h6>Saídas</h6>
                        <h4 className="saida">
                            {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            <i className="bi bi-caret-down-fill ms-1"></i>
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;