import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from '../components/card';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import '../custom.css';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// ALTERADO: Uso da instância configurada com interceptor de autenticação
import api from '../config/axios';
import { filtrarRegistrosDoUsuario } from '../utils/usuarioLogado';

function ListagemCategorias() {
  const navigate = useNavigate();

  const [dadosReceitas, setDadosReceitas] = useState([]);
  const [dadosDespesas, setDadosDespesas] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('Todas');
  const [carregando, setCarregando] = useState(true);

  const cadastrar = () => {
    navigate(`/cadastro-categorias`);
  };

  const editar = (id, tipo) => {
    navigate(`/cadastro-categorias/${id}?tipo=${tipo}`);
  };

  // Carregamento inicial robusto com tratamento correto de concorrência
  useEffect(() => {
    async function carregarCategorias() {
      try {
        const [receitasRes, despesasRes] = await Promise.all([
          api.get('/categoriasReceita'),
          api.get('/categoriasDespesa'),
        ]);

        // Filtra e injeta explicitamente o tipo do registro para identificação na tabela unificada
        const receitasFiltradas = filtrarRegistrosDoUsuario(receitasRes.data).map(r => ({ ...r, tipo: 'Receita' }));
        const despesasFiltradas = filtrarRegistrosDoUsuario(despesasRes.data).map(d => ({ ...d, tipo: 'Despesa' }));

        setDadosReceitas(receitasFiltradas);
        setDadosDespesas(despesasFiltradas);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        mensagemErro('Erro ao carregar a listagem de categorias.');
      } finally {
        setCarregando(false);
      }
    }

    carregarCategorias();
  }, []);

  async function excluir(id, tipo) {
    try {
      const rota = tipo === 'Receita' ? `/categoriasReceita/${id}` : `/categoriasDespesa/${id}`;
      
      await api.delete(rota);
      mensagemSucesso('Categoria excluída com sucesso!');

      // Atualiza o respectivo estado local de forma reativa
      if (tipo === 'Receita') {
        setDadosReceitas(prev => prev.filter(item => item.id !== id));
      } else {
        setDadosDespesas(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      mensagemErro('Erro ao excluir a categoria.');
    }
  }

  function obterLancamentosFiltrados() {
    if (filtroTipo === 'Receita') return dadosReceitas;
    if (filtroTipo === 'Despesa') return dadosDespesas;
    return [...dadosReceitas, ...dadosDespesas];
  }

  if (carregando) {
    return (
      <div className="container text-center mt-5">
        <p>Carregando categorias...</p>
      </div>
    );
  }

  const listaFiltrada = obterLancamentosFiltrados();

  return (
    <div className='container'>
      <Card title='Listagem de Categorias' icon='bi bi-tags'>
        <p className='text-muted'>Aqui você pode cadastrar novas categorias de receita/despesas e criar limites de gasto para cada categoria de despesa.</p>

        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>

              <Stack spacing={1} direction='row'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={cadastrar}
                >
                  Nova Categoria
                </button>
                <button
                  onClick={() => navigate(-1)}
                  type='button'
                  className='btn btn-danger'
                >
                  Voltar
                </button>
              </Stack>

              <Stack spacing={2} direction="row" alignItems="center" marginTop={2} marginBottom={3}>
                <label><strong>Filtrar por tipo:</strong></label>
                <select
                  className="form-select"
                  style={{ width: 200 }}
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="Todas">Todas</option>
                  <option value="Receita">Receitas</option>
                  <option value="Despesa">Despesas</option>
                </select>
              </Stack>

              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Tipo</th>
                    <th scope='col'>Nome</th>
                    <th scope='col'>Limite de Gasto</th>
                    <th scope='col'>Valor do Limite</th>
                    <th scope='col'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {listaFiltrada.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        Nenhuma categoria cadastrada ou encontrada para este filtro.
                      </td>
                    </tr>
                  ) : (
                    listaFiltrada.map((dado) => (
                      <tr key={`${dado.tipo}-${dado.id}`}>
                        <td>
                          <span className={`badge ${dado.tipo === 'Receita' ? 'bg-info' : 'bg-secondary'}`}>
                            {dado.tipo}
                          </span>
                        </td>
                        <td>{dado.nome}</td>

                        <td>
                          {dado.tipo === 'Despesa'
                            ? dado.limiteGasto ? 'Sim' : 'Não'
                            : '—'}
                        </td>

                        <td>
                          {dado.tipo === 'Despesa' && dado.limiteGasto && dado.valorLimite
                            ? Number(dado.valorLimite).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })
                            : '—'}
                        </td>

                        <td>
                          <Stack spacing={1} padding={0} direction='row'>
                            <IconButton
                              aria-label='edit'
                              onClick={() => editar(dado.id, dado.tipo)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              aria-label='delete'
                              onClick={(event) =>
                                window.confirm('Você realmente deseja excluir esta categoria?')
                                  ? excluir(dado.id, dado.tipo)
                                  : event.preventDefault()
                              }
                              size="small"
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ListagemCategorias;