import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/financetrack-logo.png';
import NavbarItem from './navbarItem';
import NavbarDropdown from './navbarDropdown';

function Navbar(props) {
  const navigate = useNavigate();

  const handleLogout = () => {
    window.localStorage.clear();
    navigate('/login');
  };

  return (
    <div className='navbar navbar-expand-lg fixed-top navbar-dark bg-primary p-1' style={{ userSelect: 'none' }}>
      <div className='container-fluid'>
        <a href='/' className='navbar-brand'>
          <img src={logo} alt="FinanceTrack" style={{ maxWidth: '100px', height: '50%' }} />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarResponsive"
          aria-controls="navbarResponsive"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className='navbar-toggler-icon'></span>
        </button>

        <div className='collapse navbar-collapse' id='navbarResponsive'>
          <ul className='navbar-nav me-auto'>

            <NavbarItem
              render='true'
              href='/'
              label='Início'
              icon='bi bi-house'
            />

            <NavbarItem
              render='true'
              href='/listagem-lancamentos'
              label='Lançamentos'
              icon='bi bi-wallet2'
            />

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

            <NavbarItem
              render='true'
              href='/listagem-pagamentos'
              label='Pagamentos'
              icon='bi bi-credit-card'
            />

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

            <NavbarItem
              render='true'
              href='/listagem-clientes'
              label='Clientes'
              icon='bi bi-people'
            />
          </ul>



          {/* Menu Alinhado à Direita: Perfil e Logout */}
          <ul className='navbar-nav ms-auto align-items-lg-center'>
            {/* ADICIONADO: Link direto para a listagem/edição do perfil logado */}
            <NavbarItem
              render='true'
              href='/listagem-perfil'
              label='Meu Perfil'
              icon='bi bi-person-circle'
            />

            <li className='nav-item'>
              <button
                onClick={handleLogout}
                className='nav-link btn btn-link py-lg-0'
                style={{ textDecoration: 'none', color: 'white' }}
              >
                <i className='bi bi-box-arrow-right me-2'></i>
                Sair
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;