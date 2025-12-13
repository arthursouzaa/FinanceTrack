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

const baseDespesas = `${BASE_URL2}/Despesa`;
const baseCategoriasD = `${BASE_URL2}/CategoriaDespesa`;
const baseFormasPagamento = `${BASE_URL}/FormaPagamento`;

function ListagemPagamentos() {
  const navigate = useNavigate();

  const editar = (id) => {
    navigate(`/cadastro-lancamentos/${id}`);
  };

  const [dados, setDados] = React.useState(null);
  const [dadosCategoriasDespesa, setDadosCategoriasDespesa] = React.useState([]);
  const [dadosFormasPagamento, setDadosFormasPagamento] = React.useState([]);

  function nomeCategoria(lancamento) {
    const categoria = dadosCategoriasDespesa.find((x) => x.id === lancamento.idCategoriaDespesa);
    return categoria ? categoria.nome : lancamento.idCategoriaDespesa ?? '—';
  }

  function nomeFormaPagamento(lancamento) {
    const formaPagamento = dadosFormasPagamento.find((x) => x.id === lancamento.idFormaPagamento);
    return formaPagamento ? formaPagamento.nome : lancamento.idFormaPagamento ?? '—';
  }

  async function pagarFatura(dados) {
    try {
      const updates = dados.map(async (dado) => {
        await axios.put(`${baseDespesas}/${dado.id}`, { ...dado, paga: true }, {
          headers: { 'Content-Type': 'application/json' }
        });
      });
      await Promise.all(updates);
      mensagemSucesso('Fatura paga com sucesso!');
      setDados(prev => prev.map(d => dadosFiltrados.includes(d) ? { ...d, paga: true } : d));
    } catch (error) {
      mensagemErro('Erro ao pagar fatura');
    }
  }

  React.useEffect(() => {
    axios.get(baseDespesas).then((response) => {
      setDados(response.data);
    });
    axios.get(baseCategoriasD).then((response) => {
      setDadosCategoriasDespesa(response.data);
    });
    axios.get(baseFormasPagamento).then((response) => {
      setDadosFormasPagamento(response.data);
    });
  }, []);


  const dadosFiltrados = (dados || []).filter((dado) => Boolean(dado.parcelada) === true);

  if (!dados) return null;
  if (!dadosFiltrados) return null;
  if (!dadosCategoriasDespesa) return null;
  if (!dadosFormasPagamento) return null;

  return (
    <div className='container'>
      <Card title='Listagem de Pagamentos'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
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
                    <th scope='col'>Quantidade de Parcelas</th>
                  </tr>
                </thead>
                <tbody>

                  {dadosFiltrados.map((dado) => (
                    <>
                      <tr key={dado.id}>
                        <td>{dado.paga ? 'Pago' : 'Pendente'}</td>
                        <td>{dado.nome}</td>
                        <td>{dado.data ? new Date(dado.data).toLocaleDateString('pt-BR') : '—'}</td>
                        <td>{nomeCategoria(dado)}</td>
                        <td>{dado.volume ? 'Fixa' : 'Única'}</td>
                        <td>{typeof dado.valor === 'number'
                          ? dado.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : dado.valor
                            ? Number(dado.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : '—'}</td>
                        <td>{nomeFormaPagamento(dado)}</td>
                        <td>{dado.quantidadeParcelas}</td>
                      </tr>
                      <button type='button' className='btn btn-success' onClick={() => pagarFatura(dadosFiltrados)}>
                        Pagar Fatura
                      </button>
                    </>
                  ))}
                </tbody>
              </table>{' '}
            </div>
          </div>
        </div>
      </Card >
    </div >
  );
}

export default ListagemPagamentos;
