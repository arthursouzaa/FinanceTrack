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
import { obterUsuarioLogado } from '../utils/usuarioLogado';

function ListagemClientes() {
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const editar = (cliente) => {
    const idCliente = cliente.id;
    if (idCliente) {
      navigate(`/cadastro-tipo-perfil/${idCliente}`);
    } else {
      mensagemErro('Não foi possível identificar o ID deste cliente.');
    }
  };

  const aplicarMascaraTelefone = (valor) => {
    if (!valor) return "—";
    let v = valor.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);

    if (v.length > 6) {
      return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      return `(${v}`;
    }
    return v;
  };

  async function excluir(id) {
    const usuarioLogado = obterUsuarioLogado();
    if (String(id) === String(usuarioLogado?.id)) {
      mensagemErro('Ação não permitida: Você não pode excluir sua própria conta de administrador.');
      return;
    }

    try {
      await api.delete(`/clientes/${id}`);
      mensagemSucesso(`Cliente excluído com sucesso!`);
      setDados((dadosAtuais) => dadosAtuais.filter((dado) => dado.id !== id));
    } catch (error) {
      const mensagemDoServidor = error?.response?.data?.message || error?.response?.data;
      mensagemErro(mensagemDoServidor || `Erro ao excluir o cliente`);
      console.error(error);
    }
  }

  useEffect(() => {
    async function carregarClientes() {
      const usuarioLogado = obterUsuarioLogado();

      console.log(usuarioLogado?.nome);

      if (usuarioLogado?.admin !== true) {
        setIsAdmin(false);
        setCarregando(false);
        mensagemErro('Acesso negado: Esta tela é exclusiva para administradores.');
        return;
      }

      setIsAdmin(true);

      try {
        const response = await api.get('/clientes');
        setDados(response.data || []);
      } catch (error) {
        console.error('Erro ao buscar dados de clientes:', error);
        mensagemErro('Erro ao carregar a listagem de clientes.');
      } finally {
        setCarregando(false);
      }
    }

    carregarClientes();
  }, []);

  if (carregando) {
    return (
      <div className="container mt-5 text-center">
        <p>Carregando listagem de clientes...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Acesso Restrito!</h4>
          <p>Você não possui privilégios de administrador para visualizar esta listagem.</p>
          <hr />
            <button onClick={() => navigate('/home')} className="btn btn-outline-danger">
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  const idUsuarioLogado = obterUsuarioLogado()?.id;

  return (
    <div className='container'>
      <Card title='Gerenciamento de Clientes' icon="bi bi-people-fill">
        <p className='text-muted'>Painel de controle dos usuários cadastrados no sistema</p>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <Stack spacing={1} direction='row' marginBottom={2}>
                <button onClick={() => navigate(-1)} type='button' className='btn btn-danger'>
                  Cancelar
                </button>
              </Stack>

              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Nome</th>
                    <th scope='col'>E-mail</th>
                    <th scope='col'>Telefone</th>
                    <th scope='col'>Perfil</th>
                    <th scope='col' style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        Nenhum cliente cadastrado no sistema.
                      </td>
                    </tr>
                  ) : (
                    dados.map((cliente) => {
                      const ehOMesmoUsuario = String(cliente.id) === String(idUsuarioLogado);

                      return (
                        <tr key={cliente.id}>
                          <td>{cliente.nome} {ehOMesmoUsuario && <strong>(Você)</strong>}</td>
                          <td>{cliente.email}</td>
                          <td>{aplicarMascaraTelefone(cliente.telefone)}</td>
                          <td>
                            {cliente.admin ? (
                              <span className="badge bg-danger">Administrador</span>
                            ) : (
                              <span className="badge bg-info">Usuário Comum</span>
                            )}
                          </td>
                          <td>
                            <Stack spacing={1} padding={0} direction='row'>
                              <IconButton aria-label='edit' onClick={() => editar(cliente)}>
                                <EditIcon />
                              </IconButton>
                              
                              <IconButton
                                aria-label='delete'
                                disabled={ehOMesmoUsuario}
                                style={ehOMesmoUsuario ? { opacity: 0.4 } : {}}
                                onClick={() =>
                                  window.confirm(`Tem certeza que deseja excluir o usuário ${cliente.nome}?`) && excluir(cliente.id)
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </td>
                        </tr>
                      );
                    })
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

export default ListagemClientes;