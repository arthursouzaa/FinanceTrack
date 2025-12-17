import React from 'react';
import logo from '../assets/financetrack-logo.png';
import NavbarItem from './navbarItem';
import NavbarDropdown from './navbarDropdown';

function Navbar(props) {
  return (
    <div className='navbar navbar-expand-lg fixed-top navbar-dark bg-primary p-1' style={{ userSelect: 'none' }}>
      <div className='container-fluid'>
        <a href='/' className='navbar-brand'>
          <img src={logo} alt="FinanceTrack" style={{ maxWidth: '100px', height: '50%' }} />
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
          <span className='navbar-toggler-icon'></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarResponsive'>
          <ul className='navbar-nav'>
            <NavbarItem
              render='true'
              href='/#'
              label='Inicio'
              icon='bi bi-house'
            />
          </ul>
          <ul className='navbar-nav'>
            <NavbarItem
              render='true'
              href='/listagem-lancamentos'
              label='Lançamentos'
              icon='bi bi-wallet2'
            />
          </ul>
          <ul className='navbar-nav'>
            <NavbarDropdown
              render='true'
              href='#'
              label='Objetivos'
              link1='/listagem-metas'
              link1label='Metas'
              link2='/listagem-aportes'
              link2label='Aportes'
              icon="bi bi-cash-coin"
            />
          </ul>
          <ul className='navbar-nav'>
            <NavbarItem
              render='true'
              href='/listagem-pagamentos'
              label='Pagamentos'
              icon='bi bi-credit-card'
            />
          </ul>
          <ul className='navbar-nav'>
            <NavbarDropdown
              render='true'
              href='#'
              label='Relatórios'
              link1='/relatorio-mensal'
              link1label='Relatório Mensal'
              link2='/relatorio-anual'
              link2label='Relatório Anual'
              icon='bi bi-bank'
            />
          </ul>
          {/* <ul className='navbar-nav'>
            <NavbarItem render='true' href='/' label='Entrar' />
          </ul>
          <ul className='navbar-nav'>
            <NavbarItem render='true' href='/' label='Sair' />
          </ul> */}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
