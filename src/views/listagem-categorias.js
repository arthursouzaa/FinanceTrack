import React from 'react';

import Card from '../components/card';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import axios from 'axios';
import { BASE_URL2 } from '../config/axios';

const baseReceitas = `${BASE_URL2}/CategoriaReceita`;
const baseDespesas = `${BASE_URL2}/CategoriaDespesa`;

function ListagemCategorias() {
  const navigate = useNavigate();

  const cadastrar = () => {
    navigate(`/cadastro-categorias`);
  };

  const editar = (id, tipo) => {
    navigate(`/cadastro-categorias/${id}?tipo=${tipo}`)
  };

  const [dadosReceitas, setDadosReceitas] = React.useState(null);
  const [dadosDespesas, setDadosDespesas] = React.useState(null);
  const [filtroTipo, setFiltroTipo] = React.useState('Todas');

  async function excluir(id, tipo) {
    if (tipo == 'Receita') {
      let data = JSON.stringify({ id });
      let url = `${baseReceitas}/${id}`;
      console.log(url);
      await axios
        .delete(url, data, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(function (response) {
          mensagemSucesso(`Categoria excluída com sucesso!`);
          setDadosReceitas(
            dadosReceitas.filter((dado) => {
              return dado.id !== id;
            })
          );
        })
        .catch(function (error) {
          mensagemErro(`Erro ao excluir a categoria`);
        });
    }
    if (tipo == 'Despesa') {
      let data = JSON.stringify({ id });
      let url = `${baseDespesas}/${id}`;
      console.log(url);
      await axios
        .delete(url, data, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(function (response) {
          mensagemSucesso(`Categoria excluída com sucesso!`);
          setDadosDespesas(
            dadosDespesas.filter((dado) => {
              return dado.id !== id;
            })
          );
        })
        .catch(function (error) {
          mensagemErro(`Erro ao excluir a categoria`);
        });
    }

  }

  React.useEffect(() => {
    axios.get(baseReceitas).then((response) => {
      setDadosReceitas(response.data);
    });
    axios.get(baseDespesas).then((response) => {
      setDadosDespesas(response.data);
    });
  }, []);

  if (!dadosReceitas) return null;
  if (!dadosDespesas) return null;

  function obterLancamentosFiltrados() {
    if (filtroTipo === 'Receita') return dadosReceitas;
    if (filtroTipo === 'Despesa') return dadosDespesas;

    return [...dadosReceitas, ...dadosDespesas];
  }

  return (
    <div className='container'>
      <Card title='Listagem de Categorias'>
        <p className='text-muted'>Aqui você pode cadastrar novas categorias de receita/despesas e criar limites de gasto para cada categoria de despesa.</p>

        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>

              <Stack spacing={1} direction='row'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={() => cadastrar()}
                >
                  Nova Categoria
                </button>
                <button
                  onClick={() => navigate(-1)}
                  type='button'
                  className='btn btn-danger'
                >
                  Cancelar
                </button>
              </Stack>

              <Stack spacing={2} direction="row" alignItems="center" marginTop={2}>
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
                    <th scope='col' colSpan={2}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {obterLancamentosFiltrados().map((dado) => (
                    <tr key={`${dado.tipo}-${dado.id}`}>
                      <td>{dado.tipo}</td>
                      <td>{dado.nome}</td>

                      <td>
                        {dado.tipo === 'Despesa'
                          ? dado.limiteGasto ? 'Sim' : 'Não'
                          : '—'}
                      </td>

                      <td>
                        {dado.tipo === 'Despesa' && dado.limiteGasto
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
                          >
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            aria-label='delete'
                            onClick={(event) =>
                              window.confirm('Você realmente deseja excluir?')
                                ? excluir(dado.id, dado.tipo)
                                : event.preventDefault()
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>{' '}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ListagemCategorias;
