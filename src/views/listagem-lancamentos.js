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

const baseReceitas = `${BASE_URL}/receitas`;
const baseDespesas = `${BASE_URL}/despesas`;
const baseCategoriasR = `${BASE_URL}/categoriasReceita`;
const baseCategoriasD = `${BASE_URL}/categoriasDespesa`;
const baseFormasPagamento = `${BASE_URL}/formasPagamento`;

function ListagemLancamentos() {
  const navigate = useNavigate();

  const [dadosReceitas, setDadosReceitas] = useState(null);
  const [dadosDespesas, setDadosDespesas] = useState(null);
  const [dadosCategoriasReceita, setDadosCategoriasReceita] = useState([]);
  const [dadosCategoriasDespesa, setDadosCategoriasDespesa] = useState([]);
  const [dadosFormasPagamento, setDadosFormasPagamento] = useState([]);
  
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroMes, setFiltroMes] = useState('Todos');
  const [filtroAno, setFiltroAno] = useState('Todos');

  const cadastrar = () => {
    navigate(`/cadastro-lancamentos`);
  };

  const editar = (id, tipo) => {
    navigate(`/cadastro-lancamentos/${id}?tipo=${tipo}`);
  };

  // Função robusta de data para exibição na tabela
  const formatarDataParaExibicao = (dataIso) => {
    if (!dataIso) return '—';
    try {
      const data = new Date(dataIso);
      if (isNaN(data.getTime())) return dataIso;
      const dia = String(data.getUTCDate()).padStart(2, '0');
      const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
      const ano = data.getUTCFullYear();
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dataIso;
    }
  };

  async function excluir(id, tipo) {
    const url = tipo === 'Receita' ? `${baseReceitas}/${id}` : `${baseDespesas}/${id}`;
    
    try {
      // Correção estrutural do delete no Axios
      await axios.delete(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      mensagemSucesso(`${tipo} excluída com sucesso!`);
      
      if (tipo === 'Receita') {
        setDadosReceitas((atuais) => atuais.filter((dado) => dado.id !== id));
      } else {
        setDadosDespesas((atuais) => atuais.filter((dado) => dado.id !== id));
      }
    } catch (error) {
      mensagemErro(`Erro ao excluir o lançamento`);
      console.error(error);
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

  useEffect(() => {
    axios.get(baseReceitas).then((response) => {
      setDadosReceitas(filtrarRegistrosDoUsuario(response.data).map(r => ({ ...r, tipo: 'Receita' })));
    });
    axios.get(baseDespesas).then((response) => {
      setDadosDespesas(filtrarRegistrosDoUsuario(response.data).map(d => ({ ...d, tipo: 'Despesa' })));
    });
    axios.get(baseCategoriasR).then((response) => {
      setDadosCategoriasReceita(filtrarRegistrosDoUsuario(response.data));
    });
    axios.get(baseCategoriasD).then((response) => {
      setDadosCategoriasDespesa(filtrarRegistrosDoUsuario(response.data));
    });
    axios.get(baseFormasPagamento).then((response) => {
      setDadosFormasPagamento(filtrarRegistrosDoUsuario(response.data));
    });
  }, []);

  // Garante que o app não trave enquanto carrega os dados principais
  if (dadosReceitas === null || dadosDespesas === null) {
    return (
      <div className="container mt-5 text-center">
        <p>Carregando lançamentos...</p>
      </div>
    );
  }

  function obterLancamentosFiltrados() {
    let lista = [];

    if (filtroTipo === 'Receita') lista = dadosReceitas;
    else if (filtroTipo === 'Despesa') lista = dadosDespesas;
    else lista = [...dadosReceitas, ...dadosDespesas];

    return lista.filter((lancamento) => {
      if (!lancamento.data) return true;

      // Extrações baseadas em UTC para evitar dessincronização de fuso horário
      const dataObj = new Date(lancamento.data);
      const mes = dataObj.getUTCMonth() + 1;
      const ano = dataObj.getUTCFullYear();

      const filtraMes = filtroMes === 'Todos' || mes === Number(filtroMes);
      const filtraAno = filtroAno === 'Todos' || ano === Number(filtroAno);

      return filtraMes && filtraAno;
    });
  }

  function obterAnosDisponiveis() {
    const todasDatas = [...dadosReceitas, ...dadosDespesas]
      .filter((l) => l.data)
      .map((l) => new Date(l.data).getUTCFullYear());

    const anosUnicos = [...new Set(todasDatas)];
    return anosUnicos.sort((a, b) => b - a);
  }

  function somarValores(lista) {
    return lista.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  const lancamentosFiltrados = obterLancamentosFiltrados();
  const receitasFiltradas = lancamentosFiltrados.filter((l) => l.tipo === 'Receita');
  const despesasFiltradas = lancamentosFiltrados.filter((l) => l.tipo === 'Despesa');

  const totalReceitas = somarValores(receitasFiltradas);
  const totalDespesas = somarValores(despesasFiltradas);

  return (
    <div className='container'>
      <Card title='Listagem de Lançamentos' icon='bi bi-wallet2'>
        <p className='text-muted'>Total de suas Receitas e Despesas</p>

        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              
              <Stack spacing={2} direction="row" alignItems="center" marginBottom={2}>
                <label className='label-filtro'><strong>Selecione o tipo:</strong></label>
                <select
                  className="form-select"
                  style={{ width: 200 }}
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Receita">Receitas</option>
                  <option value="Despesa">Despesas</option>
                </select>
              </Stack>

              <strong className='label-filtro'>Selecione o período:</strong>
              <Stack spacing={2} direction="row" alignItems="center" marginTop={2}>
                <label><strong>Mês:</strong></label>
                <select
                  className="form-select"
                  style={{ width: 150 }}
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="1">Janeiro</option>
                  <option value="2">Fevereiro</option>
                  <option value="3">Março</option>
                  <option value="4">Abril</option>
                  <option value="5">Maio</option>
                  <option value="6">Junho</option>
                  <option value="7">Julho</option>
                  <option value="8">Agosto</option>
                  <option value="9">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>

                <label><strong>Ano:</strong></label>
                <select
                  className="form-select"
                  style={{ width: 120 }}
                  value={filtroAno}
                  onChange={(e) => setFiltroAno(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  {obterAnosDisponiveis().map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </Stack>

              <Stack spacing={2} direction="row" sx={{ mt: 2, mb: 2 }}>
                <div className="resumo-card receita">
                  <span className="resumo-titulo">Receitas</span>
                  <span className="resumo-valor positivo">
                    {totalReceitas > 0 ? formatarMoeda(totalReceitas) : '—'} ▲
                  </span>
                </div>

                <div className="resumo-card despesa">
                  <span className="resumo-titulo">Despesas</span>
                  <span className="resumo-valor negativo">
                    {totalDespesas > 0 ? formatarMoeda(totalDespesas) : '—'} ▼
                  </span>
                </div>
              </Stack>

              <Stack spacing={1} direction='row' marginBottom={3}>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={cadastrar}
                >
                  Novo Lançamento
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
                    <th scope='col'>Tipo</th>
                    <th scope='col'>Nome</th>
                    <th scope='col'>Data</th>
                    <th scope='col'>Categoria</th>
                    <th scope='col'>Volume</th>
                    <th scope='col'>Valor</th>
                    <th scope='col'>Forma de Pagamento</th>
                    <th scope='col'>Parcelada</th>
                    <th scope='col' style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-muted">
                        Nenhum lançamento encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    lancamentosFiltrados.map((dado) => (
                      <tr key={`${dado.tipo}-${dado.id}`}>
                        <td>
                          <span className={`badge ${dado.tipo === 'Receita' ? 'bg-success' : 'bg-danger'}`}>
                            {dado.tipo}
                          </span>
                        </td>
                        <td>{dado.nome}</td>
                        <td>{formatarDataParaExibicao(dado.data)}</td>
                        <td>{nomeCategoria(dado)}</td>
                        <td>{dado.volume ? 'Fixa' : 'Única'}</td>
                        <td>
                          {dado.valor
                            ? Number(dado.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : '—'}
                        </td>
                        <td>{nomeFormaPagamento(dado)}</td>
                        <td>{dado.parcelada ? `${dado.quantidadeParcelas}x` : 'Não'}</td>
                        <td>
                          <Stack spacing={1} padding={0} direction="row">
                            <IconButton
                              aria-label="edit"
                              onClick={() => editar(dado.id, dado.tipo)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() =>
                                window.confirm('Você realmente deseja excluir este lançamento?') &&
                                excluir(dado.id, dado.tipo)
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

export default ListagemLancamentos;