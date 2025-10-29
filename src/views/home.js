import React from 'react';
import Card from '../components/card';

function Home() {
    return (
        <div className="container" style={{textAlign: 'center'}}>
            <img src={require('../assets/financetrack-slogan.png')} alt="FinanceTrack Slogan" style={{ maxWidth: '50%' }} />
            <h3>Bem vindo ao seu sistema de controle financeiro pessoal.</h3>
        </div>

    );
}

export default Home;