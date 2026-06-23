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

function ListagemMetas() {
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);
  const [dadosAportes, setDadosAportes] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const cadastrar = () => {
    navigate(`/cadastro-metas`);
  };

  const editar = (id) => {
    navigate(`/cadastro-metas/${id}`);
  };

  const formatarDataParaMesAno = (dataIso) => {
    if (!dataIso) return '—';
    try {
      const data = new Date(dataIso);
      const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
      const ano = data.getUTCFullYear();
      return `${mes}/${ano}`;
    } catch {
      return dataIso;
    }
  };

  async function excluir(id) {
    try {
      await api.delete(`/metasFinanceiras/${id}`);

      mensagemSucesso(`Meta excluída com sucesso!`);
      setDados((dadosAtuais) => dadosAtuais.filter((dado) => dado.id !== id));
    } catch (error) {
      mensagemErro(`Erro ao excluir a meta`);
      console.error(error);
    }
  }

useEffect(() => {
    async function carregarDadosMetas() {
      try {
        const [metasRes, aportesRes] = await Promise.all([
          api.get('/metasFinanceiras'),
          api.get('/aportes')
        ]);

        const metasDoUsuario = filtrarRegistrosDoUsuario(metasRes.data || []);
        setDados(metasDoUsuario);

        const idsMetasDoUsuario = new Set(metasDoUsuario.map(meta => String(meta.id)));

        const aportesBrutos = aportesRes.data || [];
        const aportesFiltrados = aportesBrutos.filter(aporte => 
          idsMetasDoUsuario.has(String(aporte.idMetaFinanceira))
        );

        setDadosAportes(aportesFiltrados);
      } catch (error) {
        console.error('Erro ao buscar dados de metas:', error);
        mensagemErro('Erro ao carregar a listagem de metas.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosMetas();
  }, []);

  function totalInvestido(meta) {
    if (!meta) return 0;

    const toNumber = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const aportes = (dadosAportes || []).filter(
      (a) => String(a.idMetaFinanceira || a.metaFinanceira?.id) === String(meta.id)
    );
    
    const totalAportes = aportes.reduce((sum, a) => sum + toNumber(a.valor), 0);

    return totalAportes + toNumber(meta.investimentoInicial);
  }

  function isMetaConcluida(meta) {
    const total = totalInvestido(meta);
    return total >= Number(meta.valor);
  }

  if (carregando) {
    return (
      <div className="container mt-5 text-center">
        <p>Carregando metas...</p>
      </div>
    );
  }

  const metasFiltradas = dados.filter((meta) => {
    if (!statusFiltro) return true;
    const concluida = isMetaConcluida(meta);
    if (statusFiltro === 'CONCLUIDA') return concluida;
    if (statusFiltro === 'ABERTA') return !concluida;
    return true;
  });

  const totalInvestidoFiltrado = metasFiltradas.reduce((acc, meta) => {
    return acc + totalInvestido(meta);
  }, 0);

  return (
    <div className='container'>
      <Card title='Listagem de Metas Financeiras' icon="bi bi-cash-coin">
        <p className='text-muted'>Consulte as suas metas financeiras</p>

        <Stack spacing={2} direction="row" alignItems="center" marginTop={2}>
          <label className='label-filtro'>
            Selecione o status Concluído ou Em Aberto:
          </label>
          <select
            className='form-select'
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            style={{ width: 200 }}
          >
            <option value=''>Todos</option>
            <option value='CONCLUIDA'>Concluída</option>
            <option value='ABERTA'>Em Aberto</option>
          </select>
        </Stack>

        <div className='row mt-3 mb-3'>
          <div className='col-md-3'>
            <div className='resumo-card'>
              <span className='resumo-titulo'>Total Investido (Filtrado)</span>
              <span className='resumo-valor'>
                {totalInvestidoFiltrado > 0
                  ? totalInvestidoFiltrado.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })
                  : 'R$ 0,00'}
              </span>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <Stack spacing={1} direction='row' className='mb-3'>
                <button type='button' className='btn btn-primary' onClick={cadastrar}>
                  Nova Meta
                </button>
                <button onClick={() => navigate(-1)} type='button' className='btn btn-danger'>
                  Cancelar
                </button>
              </Stack>

              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Nome</th>
                    <th scope='col'>Data-Envio</th>
                    <th scope='col'>Valor-Alvo</th>
                    <th scope='col'>Data-Alvo</th>
                    <th scope='col'>Total Investido</th>
                    <th scope='col' style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {metasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted">Nenhuma meta encontrada.</td>
                    </tr>
                  ) : (
                    metasFiltradas.map((dado) => (
                      <tr key={dado.id}>
                        <td className={
                          isMetaConcluida(dado)
                            ? 'text-success fw-bold'
                            : ''
                        }>{dado.nome}</td>
                        <td className={
                          isMetaConcluida(dado)
                            ? 'text-success fw-bold'
                            : ''
                        }>{formatarDataParaMesAno(dado.dataEnvio)}</td>
                        <td className={
                          isMetaConcluida(dado)
                            ? 'text-success fw-bold'
                            : ''
                        }>
                          {dado.valor
                            ? Number(dado.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : '—'}
                        </td>
                        <td className={
                          isMetaConcluida(dado)
                            ? 'text-success fw-bold'
                            : ''
                        }>{formatarDataParaMesAno(dado.dataAlvo)}</td>
                        <td
                          className={
                            isMetaConcluida(dado)
                              ? 'text-success fw-bold'
                              : ''
                          }
                        >
                          {totalInvestido(dado).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </td>
                        <td>
                          <Stack spacing={1} direction='row'>
                            <IconButton aria-label='edit' onClick={() => editar(dado.id)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label='delete'
                              onClick={() => window.confirm("Tem certeza de que deseja excluir? Isso apagará os registros relacionados, como os aportes.") && excluir(dado.id)}
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

export default ListagemMetas;