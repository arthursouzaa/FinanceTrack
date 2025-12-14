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
  const [filtroTipo, setFiltroTipo] = React.useState('Todas');
  const [filtroMes, setFiltroMes] = React.useState('Todos');
  const [filtroAno, setFiltroAno] = React.useState('Todos');

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

  function obterLancamentosFiltrados() {
    let lista = [];

    if (filtroTipo === 'Receita') lista = dadosReceitas;
    else if (filtroTipo === 'Despesa') lista = dadosDespesas;
    else lista = [...dadosReceitas, ...dadosDespesas];

    return lista.filter((lancamento) => {
      if (!lancamento.data) return true;

      const mes = extrairMes(lancamento.data);
      const ano = extrairAno(lancamento.data);

      const filtraMes =
        filtroMes === 'Todos' || mes === Number(filtroMes);

      const filtraAno =
        filtroAno === 'Todos' || ano === Number(filtroAno);

      return filtraMes && filtraAno;
    });
  }

  function extrairMes(data) {
    return new Date(data).getMonth() + 1; // 1 a 12
  }

  function extrairAno(data) {
    return new Date(data).getFullYear();
  }

  function obterAnosDisponiveis() {
    const todasDatas = [
      ...dadosReceitas,
      ...dadosDespesas
    ]
      .filter(l => l.data)
      .map(l => new Date(l.data).getFullYear());

    const anosUnicos = [...new Set(todasDatas)];

    return anosUnicos.sort((a, b) => b - a);
  }

  function somarValores(lista) {
    return lista.reduce((acc, item) => {
      const valor = Number(item.valor) || 0;
      return acc + valor;
    }, 0);
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  const totalReceitas = somarValores(dadosReceitas);
  const totalDespesas = somarValores(dadosDespesas);

  return (
    <div className='container'>
      <Card title='Listagem de Lançamentos'>
        <p className='text-muted'>Total de suas Receitas e Despesas</p>
        
        <Stack spacing={2} direction="row" sx={{ mb: 2 }}>
          <div className="resumo-card receita">
            <span className="resumo-titulo">Receitas</span>
            <span className="resumo-valor positivo">
              {formatarMoeda(totalReceitas)} ▲
            </span>
          </div>

          <div className="resumo-card despesa">
            <span className="resumo-titulo">Despesas</span>
            <span className="resumo-valor negativo">
              {formatarMoeda(totalDespesas)} ▼
            </span>
          </div>
        </Stack>

        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <Stack spacing={1} direction='row'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={() => cadastrar()}
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
                  {obterLancamentosFiltrados().map((dado) => (
                    <tr key={`${dado.tipo}-${dado.id}`}>
                      <td>{dado.tipo}</td>
                      <td>{dado.nome}</td>
                      <td>{dado.data ? new Date(dado.data).toLocaleDateString('pt-BR') : '—'}</td>
                      <td>{nomeCategoria(dado)}</td>
                      <td>{dado.volume ? 'Fixa' : 'Única'}</td>
                      <td>
                        {typeof dado.valor === 'number'
                          ? dado.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : dado.valor
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

export default ListagemLancamentos;
