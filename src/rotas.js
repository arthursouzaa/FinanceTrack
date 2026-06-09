import React from 'react';
import { useLocation } from 'react-router-dom';

import Home from './views/home';
import Login from './views/login';

import CadastroMetas from './views/cadastro-metas';
import CadastroAportes from './views/cadastro-aportes';
import CadastroFormasPagamento from './views/cadastro-formasPagamento';
import CadastroCategorias from './views/cadastro-categorias';
import CadastroLancamentos from './views/cadastro-lancamentos';

import ListagemMetas from './views/listagem-metas';
import ListagemAportes from './views/listagem-aportes';
import ListagemFormasPagamento from './views/listagem-formasPagamento';
import ListagemCategorias from './views/listagem-categorias';
import ListagemLancamentos from './views/listagem-lancamentos';
import ListagemPagamentos from './views/listagem-pagamentos';
import ListagemPerfil from './views/listagem-perfil';

import RelatorioMensal from './views/relatorio-mensal';
import RelatorioAnual from './views/relatorio-anual';

import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { RotaProtegida } from './utils/RotaProtegida';
import Navbar from './components/navbar';

function RotasInternas() {
  const location = useLocation();
  
  // Não mostrar navbar na página de login
  const mostrarNavbar = location.pathname !== '/login';

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<RotaProtegida element={<Home />} />} />

        <Route path='/cadastro-metas/:idParam?' element={<RotaProtegida element={<CadastroMetas />} />} />
        <Route path='/cadastro-aportes/:idParam?' element={<RotaProtegida element={<CadastroAportes />} />} />
        <Route path='/cadastro-formasPagamento/:idParam?' element={<RotaProtegida element={<CadastroFormasPagamento />} />} />
        <Route path='/cadastro-categorias/:idParam?' element={<RotaProtegida element={<CadastroCategorias />} />} />
        <Route path='/cadastro-lancamentos/:idParam?' element={<RotaProtegida element={<CadastroLancamentos />} />} />

        <Route path='/listagem-metas' element={<RotaProtegida element={<ListagemMetas />} />} />
        <Route path='/listagem-aportes' element={<RotaProtegida element={<ListagemAportes />} />} />
        <Route path='/listagem-formasPagamento' element={<RotaProtegida element={<ListagemFormasPagamento />} />} />
        <Route path='/listagem-categorias' element={<RotaProtegida element={<ListagemCategorias />} />} />
        <Route path='/listagem-lancamentos' element={<RotaProtegida element={<ListagemLancamentos />} />} />
        <Route path='/listagem-pagamentos' element={<RotaProtegida element={<ListagemPagamentos />} />} />
        <Route path='/listagem-perfil/:idParam?' element={<RotaProtegida element={<ListagemPerfil />} />} />

        <Route path='/relatorio-mensal' element={<RotaProtegida element={<RelatorioMensal />} />} />
        <Route path='/relatorio-anual' element={<RotaProtegida element={<RelatorioAnual />} />} />
      </Routes>
      {mostrarNavbar && <Navbar />}
    </>
  );
}

function Rotas(props) {
  return (
    <BrowserRouter>
      <RotasInternas />
    </BrowserRouter>
  );
}

export default Rotas;
