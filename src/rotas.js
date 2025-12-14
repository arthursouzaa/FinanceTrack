import React from 'react';

import Home from './views/home';

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

import { Route, Routes, BrowserRouter } from 'react-router-dom';

function Rotas(props) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/cadastro-metas/:idParam?' element={<CadastroMetas />} />
        <Route path='/cadastro-aportes/:idParam?' element={<CadastroAportes />} />
        <Route path='/cadastro-formasPagamento/:idParam?' element={<CadastroFormasPagamento />} />
        <Route path='/cadastro-categorias/:idParam?' element={<CadastroCategorias />} />
        <Route path='/cadastro-lancamentos/:idParam?' element={<CadastroLancamentos />} />

        <Route path='/listagem-metas' element={<ListagemMetas />} />
        <Route path='/listagem-aportes' element={<ListagemAportes />} />
        <Route path='/listagem-formasPagamento' element={<ListagemFormasPagamento />} />
        <Route path='/listagem-categorias' element={<ListagemCategorias />} />
        <Route path='/listagem-lancamentos' element={<ListagemLancamentos />} />
        <Route path='/listagem-pagamentos' element={<ListagemPagamentos />} />
        <Route path='/listagem-perfil' element={<ListagemPerfil />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Rotas;
