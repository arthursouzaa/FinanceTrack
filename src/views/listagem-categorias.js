import React, { useEffect, useState } from 'react';

import Card from '../components/card';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import axios from 'axios';
import { BASE_URL2 } from '../config/axios';

function ListagemCategorias() {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function carregar() {
      try {
        setLoading(true);
        const [receitaRes, despesaRes] = await Promise.all([
          axios.get(`${BASE_URL2}/CategoriaReceita`).catch(() => ({ data: [] })),
          axios.get(`${BASE_URL2}/CategoriaDespesa`).catch(() => ({ data: [] })),
        ]);

        if (!mounted) return;

        const receitas = (receitaRes.data || []).map((r) => ({ ...r, tipo: 'receita' }));
        const despesas = (despesaRes.data || []).map((d) => ({ ...d, tipo: 'despesa' }));

        const merged = [...receitas, ...despesas].sort((a, b) =>
          (a.nome || '').localeCompare(b.nome || '')
        );

        setCategorias(merged);
      } catch (error) {
        console.error(error);
        mensagemErro('Erro ao carregar categorias');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    carregar();
    return () => {
      mounted = false;
    };
  }, []);

  const cadastrar = () => {
    navigate('/cadastro-categorias');
  };

  const editar = (categoria) => {
    navigate(`/cadastro-categorias/${categoria.id}`, { state: { tipo: categoria.tipo } });
  };

  const excluir = async (categoria) => {
    const collection = categoria.tipo === 'receita' ? 'CategoriaReceita' : 'CategoriaDespesa';
    try {
      await axios.delete(`${BASE_URL2}/${collection}/${categoria.id}`);
      mensagemSucesso('Categoria excluída com sucesso!');
      setCategorias((prev) => prev.filter((c) => !(c.id === categoria.id && c.tipo === categoria.tipo)));
    } catch (error) {
      console.error(error);
      mensagemErro('Erro ao excluir categoria');
    }
  };

  if (loading) {
    return (
      <div className='container'>
        <Card title='Listagem de Categorias'>
          <div>Carregando...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className='container'>
      <Card title='Listagem de Categorias'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <button type='button' className='btn btn-warning' onClick={cadastrar}>
                Nova Categoria
              </button>

              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Tipo</th>
                    <th scope='col'>Nome</th>
                    <th scope='col'>Limite</th>
                    <th scope='col' colSpan={2}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.length === 0 && (
                    <tr>
                      <td colSpan={4}>Nenhuma categoria encontrada</td>
                    </tr>
                  )}

                  {categorias.map((cat) => (
                    <tr key={`${cat.tipo}-${cat.id}`}>
                      <td style={{ textTransform: 'capitalize' }}>{cat.tipo}</td>
                      <td>{cat.nome}</td>
                      <td>
                        {cat.tipo === 'despesa'
                          ? cat.limiteGasto
                            ? Number(cat.valorLimite ?? 0).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })
                            : '—'
                          : '—'}
                      </td>
                      <td>
                        <Stack spacing={1} padding={0} direction='row'>
                          <IconButton aria-label='edit' onClick={() => editar(cat)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton aria-label='delete' onClick={() => excluir(cat)}>
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

export default ListagemCategorias;