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
import { BASE_URL, BASE_URL2 } from '../config/axios';

const baseReceitas = `${BASE_URL2}/Receita`;
const baseDespesas = `${BASE_URL2}/Despesa`;
const baseCategoriasR = `${BASE_URL2}/CategoriaReceita`;
const baseCategoriasD = `${BASE_URL2}/CategoriaDespesa`;
const baseFormasPagamento = `${BASE_URL}/FormaPagamento`;

function ListagemLancamentos() {
  const navigate = useNavigate();

  const cadastrar = () => {
    navigate(`/cadastro-lancamentos`);
  };

  const editar = (id, tipo) => {
    navigate(`/cadastro-lancamentos/${id}?tipo=${tipo}`)
  };

  const [dadosReceitas, setDadosReceitas] = React.useState(null);
  const [dadosDespesas, setDadosDespesas] = React.useState(null);
  const [dadosCategoriasReceita, setDadosCategoriasReceita] = React.useState([]);
  const [dadosCategoriasDespesa, setDadosCategoriasDespesa] = React.useState([]);
  const [dadosFormasPagamento, setDadosFormasPagamento] = React.useState([]);


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
          mensagemSucesso(`Lançamento excluído com sucesso!`);
          setDadosReceitas(
            dadosReceitas.filter((dado) => {
              return dado.id !== id;
            })
          );
        })
        .catch(function (error) {
          mensagemErro(`Erro ao excluir o lançamento`);
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
          mensagemSucesso(`Lançamento excluído com sucesso!`);
          setDadosDespesas(
            dadosDespesas.filter((dado) => {
              return dado.id !== id;
            })
          );
        })
        .catch(function (error) {
          mensagemErro(`Erro ao excluir o lançamento`);
        });
    }
  }

  function nomeCategoria(lancamento) {
    if (lancamento.tipo === 'Receita') {
      const categoria = dadosCategoriasReceita.find((x) => x.id === lancamento.idCategoriaReceita);
      return categoria ? categoria.nome : lancamento.idCategoriaReceita ?? '—';
    }
    const categoria = dadosCategoriasDespesa.find((x) => x.id === lancamento.idCategoriaDespesa);
    return categoria ? categoria.nome : lancamento.idCategoriaDespesa ?? '—';
  }

  function nomeFormaPagamento(lancamento) {
    const formaPagamento = dadosFormasPagamento.find((x) => x.id === lancamento.idFormaPagamento);
    return formaPagamento ? formaPagamento.nome : lancamento.idFormaPagamento ?? '—';
  }

  React.useEffect(() => {
    axios.get(baseReceitas).then((response) => {
      setDadosReceitas(response.data);
    });
    axios.get(baseDespesas).then((response) => {
      setDadosDespesas(response.data);
    });
    axios.get(baseCategoriasR).then((response) => {
      setDadosCategoriasReceita(response.data);
    });
    axios.get(baseCategoriasD).then((response) => {
      setDadosCategoriasDespesa(response.data);
    });
    axios.get(baseFormasPagamento).then((response) => {
      setDadosFormasPagamento(response.data);
    });
  }, []);

  if (!dadosReceitas) return null;
  if (!dadosDespesas) return null;
  if (!dadosCategoriasReceita) return null;
  if (!dadosCategoriasDespesa) return null;
  if (!dadosFormasPagamento) return null;

  return (
    <div className='container'>
      <Card title='Listagem de Lançamentos'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <button
                type='button'
                className='btn btn-warning'
                onClick={() => cadastrar()}
              >
                Novo Lançamento
              </button>
              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Tipo</th>
                    <th scope='col'>Nome</th>
                    <th scope='col'>Data</th>
                    <th scope='col'>Categoria</th>
                    <th scope='col'>Volume</th>
                    <th scope='col'>Valor</th>
                    <th scope='col'>Forma de Pagamento</th>
                    <th scope='col'>Parcelada</th>
                    <th scope='col' colSpan={2}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosReceitas.map((dado) => (
                    <tr key={dado.id}>
                      <td>{dado.tipo}</td>
                      <td>{dado.nome}</td>
                      <td>{dado.data ? new Date(dado.data).toLocaleDateString('pt-BR') : '—'}</td>
                      <td>{nomeCategoria(dado)}</td>
                      <td>{dado.volume ? 'Fixa' : 'Única'}</td>
                      <td>{typeof dado.valor === 'number'
                        ? dado.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : dado.valor
                          ? Number(dado.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '—'}</td>
                      <td>{nomeFormaPagamento(dado)}</td>
                      <td>{dado.parcelada ? 'Sim' : 'Não'}</td>
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
                            onClick={() => excluir(dado.id, dado.tipo)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                  {dadosDespesas.map((dado) => (
                    <tr key={dado.id}>
                      <td>{dado.tipo}</td>
                      <td>{dado.nome}</td>
                      <td>{dado.data ? new Date(dado.data).toLocaleDateString('pt-BR') : '—'}</td>
                      <td>{nomeCategoria(dado)}</td>
                      <td>{dado.volume ? 'Fixa' : 'Única'}</td>
                      <td>{typeof dado.valor === 'number'
                        ? dado.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : dado.valor
                          ? Number(dado.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '—'}</td>
                      <td>{nomeFormaPagamento(dado)}</td>
                      <td>{dado.parcelada ? 'Sim' : 'Não'}</td>
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
                            onClick={() => excluir(dado.id, dado.tipo)}
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

export default ListagemLancamentos;
