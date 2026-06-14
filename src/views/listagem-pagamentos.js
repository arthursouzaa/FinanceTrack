import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../components/card';
import { mensagemSucesso, mensagemErro } from '../components/toastr';

import api from '../config/axios';
import { filtrarRegistrosDoUsuario } from '../utils/usuarioLogado';

import '../custom.css';

function ListagemPagamentos() {
  const navigate = useNavigate();

  const [despesas, setDespesas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [filtroMes, setFiltroMes] = useState('Todos');
  const [filtroAno, setFiltroAno] = useState('Todos');
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState('Todas');

  useEffect(() => {
    async function carregarDadosPagamentos() {
      try {
        const [despesasRes, categoriasRes, formasRes] = await Promise.all([
          api.get('/despesas'),
          api.get('/categoriasDespesa'),
          api.get('/formasPagamento'),
        ]);

        setDespesas(filtrarRegistrosDoUsuario(despesasRes.data));
        setCategorias(filtrarRegistrosDoUsuario(categoriasRes.data));
        setFormasPagamento(filtrarRegistrosDoUsuario(formasRes.data));
      } catch (error) {
        console.error('Erro ao carregar dados de pagamentos:', error);
        mensagemErro('Erro ao carregar dados de faturas.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosPagamentos();
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
    if (despesasParceladasFiltradas.length === 0) {
      mensagemErro('Não há lançamentos pendentes para pagar no filtro atual.');
      return;
    }

    try {
      await Promise.all(
        despesasParceladasFiltradas.map((despesa) =>
          api.put(`/despesas/${despesa.id}`, { ...despesa, paga: true })
        )
      );

      setDespesas((prev) =>
        prev.map((d) =>
          despesasParceladasFiltradas.some((p) => p.id === d.id)
            ? { ...d, paga: true }
            : d
        )
      );

      mensagemSucesso('Fatura paga com sucesso!');
    } catch (error) {
      console.error('Erro ao processar pagamento da fatura:', error);
      mensagemErro('Erro ao pagar fatura');
    }
  }

  function obterDadosFiltrados(dados) {
    return dados.filter((dado) => {
      if (!dado.data) return true;

      const formaPagamento = obterNomeFormaPagamento(dado);
      
      const dataObj = new Date(dado.data);
      const mes = dataObj.getUTCMonth() + 1;
      const ano = dataObj.getUTCFullYear();

      const filtraFormaPagamento =
        filtroFormaPagamento === 'Todas' || formaPagamento === filtroFormaPagamento;

      const filtraMes = filtroMes === 'Todos' || mes === Number(filtroMes);
      const filtraAno = filtroAno === 'Todos' || ano === Number(filtroAno);

      return filtraMes && filtraAno && filtraFormaPagamento;
    });
  }

  function obterAnosDisponiveis() {
    const todasDatas = [...despesasParceladas]
      .filter((l) => l.data)
      .map((l) => new Date(l.data).getUTCFullYear());

    const anosUnicos = [...new Set(todasDatas)];
    return anosUnicos.sort((a, b) => b - a);
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function somarValores(lista) {
    return lista.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  }

  const despesasParceladasFiltradas = obterDadosFiltrados(despesasParceladas);
  const totalFatura = somarValores(despesasParceladasFiltradas);
  const formasParceladas = [
    ...new Set(despesasParceladas.map((d) => obterNomeFormaPagamento(d)).filter((n) => n !== '—')),
  ];
  const formasPagamentoFiltradas = formasPagamento.filter((f) => formasParceladas.includes(f.nome));

  if (carregando) {
    return (
      <div className="container mt-5 text-center">
        <p>Carregando faturas e pagamentos...</p>
      </div>
    );
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
          <div className='col-md-3'>
            <div className="resumo-card">
              <span className="resumo-titulo">Total da Fatura (Filtrado)</span>
              <span className="resumo-valor" style={{ color: '#50bbfa' }}>
                {totalFatura > 0 ? formatarMoeda(totalFatura) : 'R$ 0,00'}
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
            {despesasParceladasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted">
                  Nenhum registro de pagamento parcelado encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              despesasParceladasFiltradas.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span className={`badge ${d.paga ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {d.paga ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td>{d.nome}</td>
                  <td>
                    {d.data
                      ? new Date(d.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                      : '—'}
                  </td>
                  <td>{obterNomeCategoria(d)}</td>
                  <td>{d.volume ? 'Fixa' : 'Única'}</td>
                  <td>{d.valor ? formatarMoeda(Number(d.valor)) : '—'}</td>
                  <td>{obterNomeFormaPagamento(d)}</td>
                  <td>{d.quantidadeParcelas ? `${d.quantidadeParcelas}x` : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Stack direction='row' spacing={1} marginTop={3}>
          <button
            type='button'
            className='btn btn-success'
            onClick={pagarFatura}
            disabled={despesasParceladasFiltradas.length === 0}
          >
            Pagar Fatura Filtrada
          </button>

          <button onClick={() => navigate(-1)} type='button' className='btn btn-danger'>
            Voltar
          </button>
        </Stack>
      </Card>
    </div>
  );
}

export default ListagemPagamentos;