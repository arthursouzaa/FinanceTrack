import React from 'react';

import Card from '../components/card';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import { useNavigate } from 'react-router-dom';

// import ListagemAportes from './listagem-aportes';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import axios from 'axios';
import { BASE_URL, BASE_URL2 } from '../config/axios';

const baseURL = `${BASE_URL}/MetaFinanceira`;

function ListagemMetas() {
  const navigate = useNavigate();

  const cadastrar = () => {
    navigate(`/cadastro-metas`);
  };

  const editar = (id) => {
    navigate(`/cadastro-metas/${id}`);
  };

  const [dados, setDados] = React.useState(null);
  const [dadosAportes, setDadosAportes] = React.useState([]);

  async function excluir(id) {
    let data = JSON.stringify({ id });
    let url = `${baseURL}/${id}`;
    console.log(url);
    await axios
      .delete(url, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(function (response) {
        mensagemSucesso(`Meta excluída com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
      })
      .catch(function (error) {
        mensagemErro(`Erro ao excluir a meta`);
      });
  }

  React.useEffect(() => {
    axios.get(baseURL).then((response) => {
      setDados(response.data);
    });
    axios.get(`${BASE_URL}/Aporte`).then((response) => {
      setDadosAportes(response.data);
    });
  }, []);

  function totalInvestido(meta) {
    if (!meta) return 0;

    const toNumber = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const aportes = (dadosAportes || []).filter((a) =>
      a.idMetaFinanceira === meta.id
    );

    const totalAportes = aportes.reduce((sum, a) => sum + toNumber(a.valor ?? a.valorAporte ?? a.valor_aporte), 0);
    return totalAportes + meta.investimentoInicial;
  }

  function totalInvestidoGeral() {
    if (!dados || !dadosAportes) return 0;

    return dados.reduce((acc, meta) => {
      return acc + totalInvestido(meta);
    }, 0);
  }

  if (!dados) return null;
  if (!dadosAportes) return null;

  return (
    <>
      <div className='container'>
        <Card title='Listagem de Metas Financeiras'>
          <p className='text-muted'>Consulte as suas metas financeiras</p>

          <div className='row mt-3 mb-3'>
            <div className='col-md-4'>
              <div
                className='p-3'
                style={{
                  border: '2px solid #6f42c1',
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                }}
              >
                <h6 style={{ marginBottom: '8px', color: '#555' }}>
                  Total Investido
                </h6>

                <h4 style={{ color: '#6f42c1', fontWeight: 'bold' }}>
                  {totalInvestidoGeral().toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </h4>
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-12'>
              <div className='bs-component'>
                <Stack spacing={1} direction='row'>
                  <button
                    type='button'
                    className='btn btn-primary'
                    onClick={() => cadastrar()}
                  >
                    Nova Meta
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
                      <th scope='col'>Nome</th>
                      <th scope='col'>Valor-Alvo</th>
                      <th scope='col'>Data-Alvo</th>
                      <th scope='col'>Total Investido</th>
                      <th scope='col' colSpan={2}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.map((dado) => (
                      <tr key={dado.id}>
                        <td>{dado.nome}</td>
                        <td>
                          {typeof dado.valor === 'number'
                            ? dado.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : dado.valor
                              ? Number(dado.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : '—'}
                        </td>
                        <td>{dado.dataAlvo}</td>
                        <td>{totalInvestido(dado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
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
      <br></br>
    </>
  );
}

export default ListagemMetas;
