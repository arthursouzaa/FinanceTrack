
import axios from 'axios';
import { BASE_URL } from '../config/axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BtnEdicao from '../components/btnEdicao';
import "../styles/home.css"
import 'bootstrap-icons/font/bootstrap-icons.css';
import { filtrarRegistrosDoUsuario, obterIdUsuarioLogado, obterUsuarioLogado } from '../utils/usuarioLogado';
import { mensagemErro } from '../components/toastr';

function Home() {
    const navigate = useNavigate();
    const [totalReceitas, setTotalReceitas] = React.useState(0);
    const [totalDespesas, setTotalDespesas] = React.useState(0);
    const [nomeUsuario, setNomeUsuario] = React.useState('');
    const [idUsuario, setIdUsuario] = React.useState(null);
    const [carregando, setCarregando] = React.useState(true);

    React.useEffect(() => {
        async function carregarDados() {
            try {
                // Verificar se há usuário logado
                const usuarioLogado = obterUsuarioLogado();
                const idUsuarioAtual = obterIdUsuarioLogado();

                if (!idUsuarioAtual) {
                    // Redirecionar para login se não houver usuário
                    navigate('/login');
                    return;
                }

                setIdUsuario(idUsuarioAtual);

                // Carregar dados em paralelo
                const [receitasRes, despesasRes, clienteRes] = await Promise.all([
                    axios.get(`${BASE_URL}/receitas`),
                    axios.get(`${BASE_URL}/despesas`),
                    axios.get(`${BASE_URL}/clientes/${idUsuarioAtual}`)
                ]);

                // Calcular somas
                const soma = (lista) =>
                    lista.reduce((acc, item) => acc + Number(item.valor || 0), 0);

                // Filtrar registros do usuário logado
                const receitasDoUsuario = filtrarRegistrosDoUsuario(receitasRes.data, idUsuarioAtual);
                const despesasDoUsuario = filtrarRegistrosDoUsuario(despesasRes.data, idUsuarioAtual);

                // Atualizar estado
                setTotalReceitas(soma(receitasDoUsuario));
                setTotalDespesas(soma(despesasDoUsuario));
                setNomeUsuario(clienteRes.data?.nome ?? usuarioLogado?.nome ?? 'Usuário');
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                mensagemErro('Erro ao carregar dados da página inicial');
                // Redirecionar para login em caso de erro
                navigate('/login');
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, [navigate]);

    if (carregando) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ textAlign: 'center' }}>
            <img src={require('../assets/financetrack-slogan.png')} alt="FinanceTrack Slogan" style={{ maxWidth: '50%' }} />

            <div id="dados-pessoais">

                <div className="perfil" style={{ padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <i className="bi bi-person-circle" alt="Imagem de perfil" style={{ fontSize: 70, marginBottom: -10 }}></i>
                    <span className="nome-usuario" style={{ margin: 0 }}>{nomeUsuario ? nomeUsuario.split(' ')[0] : 'Usuário'}</span>
                </div>

                <div className="conteudo">
                    <h3>
                        Seja bem-vindo(a), {nomeUsuario}!
                    </h3>

                    <p>
                        Na página inicial você encontra o seu saldo total. Além disso, você pode
                        editar seus dados pessoais, suas categorias de entrada/saída e formas de pagamento! 🎉
                    </p>
                    <div className="botoes">
                        <BtnEdicao
                            render='true'
                            href={idUsuario ? `/listagem-perfil/${idUsuario}` : '/listagem-perfil'}
                            label='Editar Perfil '
                        />
                        <BtnEdicao
                            render='true'
                            href='/listagem-categorias'
                            label='Editar Categorias '
                        />
                        <BtnEdicao
                            render='true'
                            href='/listagem-formasPagamento'
                            label='Editar Formas de Pagamento '
                        />
                    </div>
                </div>
            </div>

            <div className="row mt-4 justify-content-center">
                <div className="col-md-3">
                    <div className="resumo-box">
                        <h6>Saldo Total</h6>
                        <h4 className="saldo">
                            {(totalReceitas - totalDespesas).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                        </h4>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="resumo-box">
                        <h6>Entradas</h6>
                        <h4 className="entrada">
                            {totalReceitas.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                            <i className="bi bi-caret-up-fill ms-1"></i>
                        </h4>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="resumo-box">
                        <h6>Saídas</h6>
                        <h4 className="saida">
                            {totalDespesas.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                            <i className="bi bi-caret-down-fill ms-1"></i>
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;