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
import { filtrarRegistrosDoUsuario } from '../utils/usuarioLogado';

const baseURL = `${BASE_URL}/aportes`;

function ListagemAportes() {
  const navigate = useNavigate();

  const [todosAportes, setTodosAportes] = useState([]); // Guarda o retorno bruto do servidor
  const [dados, setDados] = useState([]); // Guarda apenas os aportes filtrados do usuário
  const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = useState([]);

  const cadastrar = () => {
    navigate(`/cadastro-aportes`);
  };

  const editar = (aporte) => {
    const idAporte = aporte.id ?? aporte.idAporte;
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
    let url = `${baseURL}/${id}`;
    try {
      await axios.delete(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      mensagemSucesso(`Aporte excluído com sucesso!`);
      // Remove tanto da listagem visual quanto do estado bruto
      setDados((dadosAtuais) => dadosAtuais.filter((dado) => dado.id !== id));
      setTodosAportes((dadosAtuais) => dadosAtuais.filter((dado) => dado.id !== id));
    } catch (error) {
      mensagemErro(`Erro ao excluir o aporte`);
      console.error(error);
    }
  }

  function nomeMetaFinanceira(lancamento) {
    const metaFinanceira = dadosMetasFinanceiras.find(
      (x) => (x.id ?? x.idMetaFinanceira ?? x.idMeta) === lancamento.idMetaFinanceira
    );
    return metaFinanceira ? metaFinanceira.nome : lancamento.idMetaFinanceira ?? '—';
  }

  // 1. Carrega primeiro as Metas Financeiras do Usuário Logado
  useEffect(() => {
    axios.get(`${BASE_URL}/metasFinanceiras`).then((response) => {
      // Aqui o filtrarRegistrosDoUsuario funciona perfeitamente porque a Meta tem "idCliente"
      setDadosMetasFinanceiras(filtrarRegistrosDoUsuario(response.data));
    });
  }, []);

  // 2. Carrega todos os aportes do banco
  useEffect(() => {
    axios.get(baseURL).then((response) => {
      setTodosAportes(response.data);
    });
  }, []);

  // 3. EFEITO CRUCIAL: Sempre que a lista de metas filtradas ou de aportes atualizar, faz o cruzamento
  useEffect(() => {
    if (dadosMetasFinanceiras.length >= 0 && todosAportes.length > 0) {
      // Mapeia uma lista contendo apenas os IDs das metas que pertencem ao usuário logado
      const idsMetasDoUsuario = dadosMetasFinanceiras.map(meta => meta.id ?? meta.idMetaFinanceira ?? meta.idMeta);

      // Filtra os aportes mantendo apenas aqueles cujo "idMetaFinanceira" pertence à lista acima
      const aportesFiltrados = todosAportes.filter(aporte =>
        idsMetasDoUsuario.includes(aporte.idMetaFinanceira)
      );

      setDados(aportesFiltrados);
    } else if (todosAportes.length === 0) {
      setDados([]);
    }
  }, [dadosMetasFinanceiras, todosAportes]);

  if (dados === null) {
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
                        <td>{formatarDataParaExibicao(dado.data ?? dado.dataAporte)}</td>
                        <td>
                          <Stack spacing={1} padding={0} direction='row'>
                            <IconButton aria-label='edit' onClick={() => editar(dado)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label='delete'
                              onClick={() =>
                                window.confirm("Você realmente deseja excluir este aporte?") && excluir(dado.id)
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