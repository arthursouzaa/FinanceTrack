import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../components/card';
import { mensagemSucesso, mensagemErro } from '../components/toastr';

import axios from 'axios';
import { BASE_URL, BASE_URL2 } from '../config/axios';

import '../custom.css';

const baseDespesas = `${BASE_URL2}/Despesa`;
const baseCategoriasDespesa = `${BASE_URL2}/CategoriaDespesa`;
const baseFormasPagamento = `${BASE_URL}/FormaPagamento`;

function ListagemPagamentos() {
  const navigate = useNavigate();

  const [despesas, setDespesas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [filtroMes, setFiltroMes] = React.useState('Todos');
  const [filtroAno, setFiltroAno] = React.useState('Todos');
  const [filtroFormaPagamento, setFiltroFormaPagamento] = React.useState('Todas');

  useEffect(() => {
    Promise.all([
      axios.get(baseDespesas),
      axios.get(baseCategoriasDespesa),
      axios.get(baseFormasPagamento),
    ])
      .then(([despesasRes, categoriasRes, formasRes]) => {
        setDespesas(despesasRes.data);
        setCategorias(categoriasRes.data);
        setFormasPagamento(formasRes.data);
      })
      .catch(() => mensagemErro('Erro ao carregar dados'));
  }, []);

  const despesasParceladas = useMemo(
    () => despesas.filter((d) => Boolean(d.parcelada)),
    [despesas]
  );

  function obterNomeCategoria(despesa) {
    return categorias.find((c) => c.id === despesa.idCategoriaDespesa)?.nome ?? '—';
  }

  function obterNomeFormaPagamento(despesa) {
    return formasPagamento.find((f) => f.id === despesa.idFormaPagamento)?.nome ?? '—';
  }

  async function pagarFatura() {
    try {
      await Promise.all(
        despesasParceladas.map((despesa) =>
          axios.put(
            `${baseDespesas}/${despesa.id}`,
            { ...despesa, paga: true },
            { headers: { 'Content-Type': 'application/json' } }
          )
        )
      );

      setDespesas((prev) =>
        prev.map((d) =>
          despesasParceladas.some((p) => p.id === d.id)
            ? { ...d, paga: true }
            : d
        )
      );

      mensagemSucesso('Fatura paga com sucesso!');
    } catch {
      mensagemErro('Erro ao pagar fatura');
    }
  }

  if (!despesasParceladas.length) return null;

  const despesasParceladasFiltradas = obterDadosFiltrados(despesasParceladas);
  const totalFatura = somarValores(despesasParceladasFiltradas);
  const formasParceladas = [...new Set(despesasParceladas.map(d => obterNomeFormaPagamento(d)).filter(n => n !== '—'))];
  const formasPagamentoFiltradas = formasPagamento.filter(f => formasParceladas.includes(f.nome));

  function obterDadosFiltrados(dados) {
    return dados.filter((dado) => {
      if (!dado.data) return true;

      const formaPagamento = obterNomeFormaPagamento(dado);
      const mes = extrairMes(dado.data);
      const ano = extrairAno(dado.data);

      const filtraFormaPagamento =
        filtroFormaPagamento === 'Todas' || formaPagamento === filtroFormaPagamento;

      const filtraMes =
        filtroMes === 'Todos' || mes === Number(filtroMes);

      const filtraAno =
        filtroAno === 'Todos' || ano === Number(filtroAno);

      return filtraMes && filtraAno && filtraFormaPagamento;
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
      ...despesasParceladas
    ]
      .filter(l => l.data)
      .map(l => new Date(l.data).getFullYear());

    const anosUnicos = [...new Set(todasDatas)];

    return anosUnicos.sort((a, b) => b - a);
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function somarValores(lista) {
    return lista.reduce((acc, item) => {
      const valor = Number(item.valor) || 0;
      return acc + valor;
    }, 0);
  }

  return (
    <div className='container'>
      <Card title='Listagem de Pagamentos' icon='bi bi-credit-card'>
        <p className='text-muted'>Consulte e realize o pagamento de suas faturas de compras parceladas</p>

        <Stack spacing={2} direction="row" alignItems="center" marginBottom={2}>
          <label className='label-filtro'><strong>Selecione a forma de pagamento:</strong></label>
          <select
            className="form-select"
            style={{ width: 200 }}
            value={filtroFormaPagamento}
            onChange={(e) => setFiltroFormaPagamento(e.target.value)}
          >
            <option value="Todas">Todas</option>
            {formasPagamentoFiltradas.map((forma) => (
              <option key={forma.id} value={forma.nome}>
                {forma.nome}
              </option>
            ))}
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


        <div className='row mt-3 mb-3'>
          <div className='col-md-2'>
            <div className="resumo-card">
              <span className="resumo-titulo">Total da Fatura</span>
              <span className="resumo-valor" style={{ color: '#50bbfa' }}>
                {totalFatura > 0 ? formatarMoeda(totalFatura) : '—'}
              </span>
            </div>
          </div>
        </div>

        <table className='table table-hover'>
          <thead>
            <tr>
              <th>Status</th>
              <th>Nome</th>
              <th>Data</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Forma de Pagamento</th>
              <th>Parcelas</th>
            </tr>
          </thead>
          <tbody>
            {despesasParceladasFiltradas.map((d) => (
              <tr key={d.id}>
                <td>{d.paga ? 'Pago' : 'Pendente'}</td>
                <td>{d.nome}</td>
                <td>{d.data ? new Date(d.data).toLocaleDateString('pt-BR') : '—'}</td>
                <td>{obterNomeCategoria(d)}</td>
                <td>{d.volume ? 'Fixa' : 'Única'}</td>
                <td>
                  {Number(d.valor).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>
                <td>{obterNomeFormaPagamento(d)}</td>
                <td>{d.quantidadeParcelas}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Stack direction='row' spacing={1}>
          <button
            type='button'
            className='btn btn-success'
            onClick={pagarFatura}
          >
            Pagar Fatura
          </button>

          <button
            onClick={() => navigate(-1)}
            type='button'
            className='btn btn-danger'
          >
            Cancelar
          </button>
        </Stack>
      </Card>
    </div>
  );
}

export default ListagemPagamentos;
