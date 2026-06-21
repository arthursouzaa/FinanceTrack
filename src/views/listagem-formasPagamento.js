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

function ListagemFormasPagamento() {
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const cadastrar = () => {
    navigate(`/cadastro-formasPagamento`);
  };

  const editar = (id) => {
    navigate(`/cadastro-formasPagamento/${id}`);
  };

  async function excluir(id) {
    try {
      await api.delete(`/formasPagamento/${id}`);

      mensagemSucesso(`Forma de pagamento excluída com sucesso!`);
      setDados((dadosAtuais) => dadosAtuais.filter((dado) => dado.id !== id));
    } catch (error) {
      mensagemErro(`Erro ao excluir a forma de pagamento`);
      console.error(error);
    }
  }

  useEffect(() => {
    async function carregarFormasPagamento() {
      try {
        const response = await api.get('/formasPagamento');
        setDados(filtrarRegistrosDoUsuario(response.data));
      } catch (error) {
        console.error('Erro ao buscar formas de pagamento:', error);
        mensagemErro('Erro ao carregar a listagem de formas de pagamento.');
      } finally {
        setCarregando(false);
      }
    }

    carregarFormasPagamento();
  }, []);

  if (carregando) {
    return (
      <div className="container mt-5 text-center">
        <p>Carregando formas de pagamento...</p>
      </div>
    );
  }

  return (
    <div className='container'>
      <Card title='Listagem de Formas de Pagamento' icon="bi bi-credit-card-2-back">
        <p className='text-muted'>Aqui você pode cadastrar e editar suas formas de pagamento.</p>

        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              
              <Stack spacing={1} direction='row' className='mb-3'>
                <button type='button' className='btn btn-primary' onClick={cadastrar}>
                  Nova Forma de Pagamento
                </button>
                <button onClick={() => navigate(-1)} type='button' className='btn btn-danger'>
                  Cancelar
                </button>
              </Stack>

              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Nome</th>
                    <th scope='col' style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center text-muted">
                        Nenhuma forma de pagamento encontrada.
                      </td>
                    </tr>
                  ) : (
                    dados.map((dado) => (
                      <tr key={dado.id}>
                        <td>{dado.nome}</td>
                        <td>
                          <Stack spacing={1} direction='row'>
                            <IconButton aria-label='edit' onClick={() => editar(dado.id)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label='delete'
                              onClick={() => window.confirm("Tem certeza de que deseja excluir? Isso apagará os registros relacionados, como os lançamentos de despesas.") && excluir(dado.id)}
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

export default ListagemFormasPagamento;