import React from 'react';
import logo from '../assets/financetrack-logo.png';
import NavbarItem from './navbarItem';

function Navbar(props) {
  return (
    <div className='navbar navbar-expand-lg fixed-top navbar-dark bg-primary p-1' style={{userSelect: 'none'}}>
      <div className='container-fluid'>
        <a href='/' className='navbar-brand'>
          <img src={logo} alt="FinanceTrack" style={{ maxWidth: '100px', height: '50%' }} />
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
          <span className='navbar-toggler-icon'></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarResponsive'>
          <ul className='navbar-nav'>
            <NavbarItem
              render='true'
              href='/listagem-metas'
              label='Metas'
            />
          </ul>
          <ul className='navbar-nav'>
            <NavbarItem
              render='true'
              href='/listagem-aportes'
              label='Aportes'
            />
          </ul>
          <ul className='navbar-nav'>
            <NavbarItem
              render='true'
              href='/listagem-formasPagamento'
              label='Formas de Pagamento'
            />
          </ul>
          <ul className='navbar-nav'>
            <NavbarItem
              render='true'
              href='/listagem-categorias'
              label='Categorias'
            />
          </ul>
          <ul className='navbar-nav'>
            <NavbarItem
              render='true'
              href='/listagem-lancamentos'
              label='Lançamentos'
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
