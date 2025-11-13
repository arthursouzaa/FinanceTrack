import React from 'react';
import Card from '../components/card';
import { IconButton } from '@mui/material';
import BtnEdicao from '../components/btnEdicao';
import "../styles/home.css"
import 'bootstrap-icons/font/bootstrap-icons.css';

function Home() {
    return (
        <div className="container" style={{ textAlign: 'center' }}>
            <img src={require('../assets/financetrack-slogan.png')} alt="FinanceTrack Slogan" style={{ maxWidth: '50%' }} />

            <div id="dados-pessoais">
                <div className="perfil" style={{padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <i className="bi bi-person-circle" alt="Imagem de perfil" style={{fontSize: 70, marginBottom: -10}}></i>
                    <span className="nome-usuario" style={{margin: 0}}>Ana</span>
                </div>

                <div className="conteudo">
                    <h3>Seja bem-vindo(a), Ana!</h3>
                    <p>
                        Na página inicial você encontra o seu saldo total. Além disso, você pode
                        editar seus dados pessoais, suas categorias de entrada/saída e formas de pagamento! 🎉
                    </p>

                    <div className="botoes">
                        <BtnEdicao
                            render='true'
                            href='/listagem-formasPagamento'
                            label='Editar Perfil ✏️'
                        />
                        <BtnEdicao
                            render='true'
                            href='/listagem-categorias'
                            label='Editar Categorias ✏️'
                        />
                        <BtnEdicao
                            render='true'
                            href='/listagem-formasPagamento'
                            label='Editar Formas de Pagamento ✏️'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;