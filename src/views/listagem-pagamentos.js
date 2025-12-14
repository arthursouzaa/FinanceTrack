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

  return (
    <div className='container'>
      <Card title='Listagem de Pagamentos'>
        <p className='text-muted'>Consulte e realize o pagamento de suas faturas de compras parceladas</p>
        
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
            {despesasParceladas.map((d) => (
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
