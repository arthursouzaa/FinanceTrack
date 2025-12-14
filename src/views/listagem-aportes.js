import React, { useState, useEffect } from 'react';

import Card from '../components/card';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import axios from 'axios';
import { BASE_URL } from '../config/axios';

const baseURL = `${BASE_URL}/Aporte`;

function ListagemAportes() {
  const navigate = useNavigate();

  const cadastrar = () => {
    navigate(`/cadastro-aportes`);
  };

  const editar = (id) => {
    navigate(`/cadastro-aportes/${id}`);
  };

  const [dados, setDados] = useState([]);

  async function excluir(id) {
    let data = JSON.stringify({ id });
    let url = `${baseURL}/${id}`;
    console.log(url);
    await axios
      .delete(url, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(function (response) {
        mensagemSucesso(`Aporte excluído com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
      })
      .catch(function (error) {
        mensagemErro(`Erro ao excluir o aporte`);
      });
  }

  const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = React.useState([]);

  function nomeMetaFinanceira(lancamento) {
    const metaFinanceira = dadosMetasFinanceiras.find((x) => x.id === lancamento.idMetaFinanceira);
    return metaFinanceira ? metaFinanceira.nome : lancamento.idMetaFinanceira ?? '—';
  }

  useEffect(() => {
    axios.get(`${BASE_URL}/MetaFinanceira`).then((response) => {
      setDadosMetasFinanceiras(response.data);
    });
  }, []);

  React.useEffect(() => {
    axios.get(baseURL).then((response) => {
      setDados(response.data);

    });
  }, []);

  if (!dados) return null;

  return (
    <div className='container'>
      <Card title='Listagem de Aportes'>
        <p className='text-muted'>Consulte os seus aportes</p>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <Stack spacing={1} direction='row'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={() => cadastrar()}
                >
                  Novo Aporte
                </button>
                <button
                  onClick={() => navigate(-1)}
                  type='button'
                  className='btn btn-danger'
                >
                  Cancelar
                </button>
              </Stack>
              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Meta Financeira</th>
                    <th scope='col'>Valor</th>
                    <th scope='col' colSpan={2}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((dado) => (
                    <tr key={dado.id}>
                      <td>{nomeMetaFinanceira(dado)}</td>
                      <td>
                        {typeof dado.valor === 'number'
                          ? dado.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : dado.valor
                            ? Number(dado.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : '—'}
                      </td>
                      <td>
                        <Stack spacing={1} padding={0} direction='row'>
                          <IconButton
                            aria-label='edit'
                            onClick={() => editar(dado.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label='delete'
                            onClick={(event) => window.confirm("Você realmente deseja excluir?") ? excluir(dado.id) : event.preventDefault()}
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

export default ListagemAportes;
