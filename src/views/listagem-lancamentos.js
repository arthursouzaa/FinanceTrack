import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from '../components/card';
import { mensagemSucesso, mensagemErro } from '../components/toastr';
import '../custom.css';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import axios from 'axios';
import { BASE_URL, BASE_URL2 } from '../config/axios';

function ListagemLancamentos() {
  const navigate = useNavigate();

  const baseLocal = BASE_URL2; // Receita, Despesa, Categoria*
  const baseRemote = BASE_URL; // FormaPagamento, MetaFinanceira, etc.

  const [dados, setDados] = useState([]); // merged lançamentos with tipo flag
  const [dadosCategoriasReceita, setDadosCategoriasReceita] = useState([]);
  const [dadosCategoriasDespesa, setDadosCategoriasDespesa] = useState([]);
  const [dadosFormasPagamento, setDadosFormasPagamento] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function carregar() {
      try {
        setLoading(true);
        const [
          receitasRes,
          despesasRes,
          catRecRes,
          catDespRes,
          formasRes,
        ] = await Promise.all([
          axios.get(`${baseLocal}/Receita`).catch(() => ({ data: [] })),
          axios.get(`${baseLocal}/Despesa`).catch(() => ({ data: [] })),
          axios.get(`${baseLocal}/CategoriaReceita`).catch(() => ({ data: [] })),
          axios.get(`${baseLocal}/CategoriaDespesa`).catch(() => ({ data: [] })),
          axios.get(`${baseRemote}/FormaPagamento`).catch(() => ({ data: [] })),
        ]);

        if (!mounted) return;

        const receitas = (receitasRes.data || []).map((r) => ({ ...r, tipo: 'receita' }));
        const despesas = (despesasRes.data || []).map((d) => ({ ...d, tipo: 'despesa' }));

        // keep original insertion order or sort by date/name as needed
        const merged = [...receitas, ...despesas].sort((a, b) => {
          // show newest first by date if available, fallback to nome
          const da = a.data ? new Date(a.data) : null;
          const db = b.data ? new Date(b.data) : null;
          if (da && db) return db - da;
          if (da && !db) return -1;
          if (!da && db) return 1;
          return (a.nome || '').localeCompare(b.nome || '');
        });

        setDados(merged);
        setDadosCategoriasReceita(catRecRes.data || []);
        setDadosCategoriasDespesa(catDespRes.data || []);
        setDadosFormasPagamento(formasRes.data || []);
      } catch (err) {
        console.error(err);
        mensagemErro('Erro ao carregar lançamentos');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    carregar();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cadastrar = () => {
    navigate('/cadastro-lancamentos');
  };

  const editar = (lancamento) => {
    navigate(`/cadastro-lancamentos/${lancamento.id}`, { state: { tipo: lancamento.tipo } });
  };

  const excluir = async (lancamento) => {
    const collection = lancamento.tipo === 'receita' ? 'Receita' : 'Despesa';
    if (!window.confirm('Confirma exclusão deste lançamento?')) return;
    try {
      await axios.delete(`${baseLocal}/${collection}/${lancamento.id}`);
      mensagemSucesso('Lançamento excluído com sucesso!');
      setDados((prev) => prev.filter((d) => !(d.id === lancamento.id && d.tipo === lancamento.tipo)));
    } catch (err) {
      console.error(err);
      mensagemErro('Erro ao excluir lançamento');
    }
  };

  function nomeCategoria(lanc) {
    if (lanc.tipo === 'receita') {
      const c = dadosCategoriasReceita.find((x) => x.id === lanc.idCategoriaReceita);
      return c ? c.nome : lanc.idCategoriaReceita ?? '—';
    }
    const c = dadosCategoriasDespesa.find((x) => x.id === lanc.idCategoriaDespesa);
    return c ? c.nome : lanc.idCategoriaDespesa ?? '—';
  }

  function nomeForma(id) {
    const f = dadosFormasPagamento.find((x) => x.id === id);
    return f ? f.nome : id ?? '—';
  }

  if (loading) {
    return (
      <div className='container'>
        <Card title='Listagem de Lançamentos'>
          <div>Carregando...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className='container'>
      <Card title='Listagem de Lançamentos'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <button type='button' className='btn btn-warning' onClick={cadastrar}>
                Novo Lançamento
              </button>

              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Nome</th>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Volume</th>
                    <th>Valor</th>
                    <th>Forma de Pagamento</th>
                    <th>Parcelada</th>
                    <th colSpan={2}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.length === 0 && (
                    <tr>
                      <td colSpan={10}>Nenhum lançamento encontrado</td>
                    </tr>
                  )}

                  {dados.map((l) => (
                    <tr key={`${l.tipo}-${l.id}`}>
                      <td style={{ textTransform: 'capitalize' }}>{l.tipo}</td>
                      <td>{l.nome}</td>
                      <td>{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '—'}</td>
                      <td>{nomeCategoria(l)}</td>
                      <td>{l.volume ? 'Fixa' : 'Única'}</td>
                      <td>
                        {typeof l.valor === 'number'
                          ? l.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : l.valor
                          ? Number(l.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '—'}
                      </td>
                      <td>{l.tipo === 'despesa' ? nomeForma(l.idFormaPagamento) : '—'}</td>
                      <td>
                        {l.tipo === 'despesa' ? (l.parcelada ? `${l.quantidadeParcelas || 1}x` : '—') : '—'}
                      </td>
                      <td>
                        <Stack spacing={1} padding={0} direction='row'>
                          <IconButton aria-label='edit' onClick={() => editar(l)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton aria-label='delete' onClick={() => excluir(l)}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </td>
                    </tr>
                  ))}
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