import React, { useState, useEffect } from 'react';
import Card from '../components/card';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import '../custom.css';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import api from '../config/axios';
import { filtrarRegistrosDoUsuario } from '../utils/usuarioLogado';

function ListagemAportes() {
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);
  const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const cadastrar = () => {
    navigate(`/cadastro-aportes`);
  };

  const editar = (aporte) => {
    const idAporte = aporte.id;
    if (idAporte) {
      navigate(`/cadastro-aportes/${idAporte}`);
    } else {
      mensagemErro('Não foi possível identificar o ID deste aporte.');
    }
  };

  const formatarDataParaExibicao = (dataIso) => {
    if (!dataIso) return '—';
    try {
      const data = new Date(dataIso);
      const dia = String(data.getUTCDate()).padStart(2, '0');
      const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
      const ano = data.getUTCFullYear();
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dataIso;
    }
  };

  async function excluir(id) {
    try {
      await api.delete(`/aportes/${id}`);

      mensagemSucesso(`Aporte excluído com sucesso!`);
      setDados((dadosAtuais) => dadosAtuais.filter((dado) => dado.id !== id));
    } catch (error) {
      mensagemErro(`Erro ao excluir o aporte`);
      console.error(error);
    }
  }

  function nomeMetaFinanceira(lancamento) {
    const metaFinanceira = dadosMetasFinanceiras.find((x) => x.id === lancamento.idMetaFinanceira);
    return metaFinanceira ? metaFinanceira.nome : '—';
  }

  useEffect(() => {
    async function carregarDadosListagem() {
      try {
        const [metasRes, aportesRes] = await Promise.all([
          api.get('/metasFinanceiras'),
          api.get('/aportes')
        ]);

        const metasDoUsuario = filtrarRegistrosDoUsuario(metasRes.data);
        setDadosMetasFinanceiras(metasDoUsuario);

        const idsMetasDoUsuario = metasDoUsuario.map(meta => meta.id);

        const aportesFiltrados = aportesRes.data.filter(aporte =>
          idsMetasDoUsuario.includes(aporte.idMetaFinanceira)
        );

        setDados(aportesFiltrados);
      } catch (error) {
        console.error('Erro ao buscar dados de aportes:', error);
        mensagemErro('Erro ao carregar a listagem de aportes.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosListagem();
  }, []);

  if (carregando) {
    return (
      <div className="container mt-5 text-center">
        <p>Carregando aportes...</p>
      </div>
    );
  }

  return (
    <div className='container'>
      <Card title='Listagem de Aportes' icon="bi bi-cash">
        <p className='text-muted'>Consulte os seus aportes</p>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <Stack spacing={1} direction='row' marginBottom={2}>
                <button type='button' className='btn btn-primary' onClick={cadastrar}>
                  Novo Aporte
                </button>
                <button onClick={() => navigate(-1)} type='button' className='btn btn-danger'>
                  Cancelar
                </button>
              </Stack>

              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Meta Financeira</th>
                    <th scope='col'>Valor</th>
                    <th scope='col'>Data</th>
                    <th scope='col' style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">
                        Nenhum aporte encontrado para as suas metas.
                      </td>
                    </tr>
                  ) : (
                    dados.map((dado) => (
                      <tr key={dado.id}>
                        <td>{nomeMetaFinanceira(dado)}</td>
                        <td>
                          {dado.valor
                            ? Number(dado.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : '—'}
                        </td>
                        <td>{formatarDataParaExibicao(dado.dataEnvio)}</td>
                        <td>
                          <Stack spacing={1} padding={0} direction='row'>
                            <IconButton aria-label='edit' onClick={() => editar(dado)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label='delete'
                              onClick={() =>
                                window.confirm("Tem certeza que deseja excluir?") && excluir(dado.id)
                              }
                            >
                              <DeleteIcon />
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

export default ListagemAportes;