
import axios from 'axios';
import { BASE_URL2 } from '../config/axios';
import React from 'react';
import Card from '../components/card';
import BtnEdicao from '../components/btnEdicao';
import "../styles/home.css"
import 'bootstrap-icons/font/bootstrap-icons.css';

function Home() {
    const [totalReceitas, setTotalReceitas] = React.useState(0);
    const [totalDespesas, setTotalDespesas] = React.useState(0);

    React.useEffect(() => {
        async function carregarTotais() {
            try {
                const [receitasRes, despesasRes] = await Promise.all([
                    axios.get(`${BASE_URL2}/Receita`),
                    axios.get(`${BASE_URL2}/Despesa`)
                ]);

                const soma = (lista) =>
                    lista.reduce((acc, item) => acc + Number(item.valor || 0), 0);

                const receitas = soma(receitasRes.data);
                const despesas = soma(despesasRes.data);

                setTotalReceitas(receitas);
                setTotalDespesas(despesas);
            } catch {
                // opcional: toastr de erro
            }
        }

        carregarTotais();
    }, []);

    return (
        <div className="container" style={{ textAlign: 'center' }}>
            <img src={require('../assets/financetrack-slogan.png')} alt="FinanceTrack Slogan" style={{ maxWidth: '50%' }} />

            <div id="dados-pessoais">
                
                <div className="perfil" style={{ padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <i className="bi bi-person-circle" alt="Imagem de perfil" style={{ fontSize: 70, marginBottom: -10 }}></i>
                    <span className="nome-usuario" style={{ margin: 0 }}>Arthur</span>
                </div>

                <div className="conteudo">
                    <h3>Seja bem-vindo(a), Arthur!</h3>
                    <p>
                        Na página inicial você encontra o seu saldo total. Além disso, você pode
                        editar seus dados pessoais, suas categorias de entrada/saída e formas de pagamento! 🎉
                    </p>
                    <div className="botoes">
                        <BtnEdicao
                            render='true'
                            href='/listagem-perfil'
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