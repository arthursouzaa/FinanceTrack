import React from 'react';

import ListagemMetas from './views/listagem-metas';
import ListagemAportes from './views/listagem-aportes';
import ListagemFormasPagamento from './views/listagem-formasPagamento';
// import ListagemAlunos from './views/listagem-alunos';
// import ListagemCategorias from './views/listagem-categorias';
// import ListagemAtividadesComplementares from './views/listagem-atividades-complementares';
// import AcompanhamentoAtividadesComplementares from './views/acompanhamento-atividades-complementares';

// import Login from './views/login';
import CadastroMeta from './views/cadastro-metas';
import CadastroAporte from './views/cadastro-aportes';
import CadastroFormasPagamento from './views/cadastro-formasPagamento';
// import CadastroAluno from './views/cadastro-aluno';
// import CadastroCategoria from './views/cadastro-categoria';
// import CadastroAtividadeComplementar from './views/cadastro-atividade-complementar';

import { Route, Routes, BrowserRouter } from 'react-router-dom';

function Rotas(props) {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path='/login' element={<Login />} /> */}
        <Route
          path='/cadastro-metas/:idParam?'
          element={<CadastroMeta />}
        />
        <Route path='/cadastro-aportes/:idParam?' element={<CadastroAporte />} />
        <Route
          path='/cadastro-formasPagamento/:idParam?'
          element={<CadastroFormasPagamento />}
        />
        {/* <Route path='/cadastro-alunos/:idParam?' element={<CadastroAluno />} />
        <Route
          path='/cadastro-categorias/:idParam?'
          element={<CadastroCategoria />}
        />
        <Route
          path='/cadastro-atividades-complementares/:idParam?'
          element={<CadastroAtividadeComplementar />}
        /> */}
        <Route path='/listagem-metas' element={<ListagemMetas />} />
        <Route path='/listagem-aportes' element={<ListagemAportes />} />
        <Route path='/listagem-formasPagamento' element={<ListagemFormasPagamento />} />
        {/* <Route path='/listagem-alunos' element={<ListagemAlunos />} />
        <Route path='/listagem-categorias' element={<ListagemCategorias />} />
        <Route
          path='/listagem-atividades-complementares'
          element={<ListagemAtividadesComplementares />}
        />
        <Route
          path='/acompanhamento-atividades-complementares'
          element={<AcompanhamentoAtividadesComplementares />}
        /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default Rotas;
