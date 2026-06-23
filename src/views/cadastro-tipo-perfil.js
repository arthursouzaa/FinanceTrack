import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';
import '../custom.css';

import api from '../config/axios';
import { obterUsuarioLogado } from '../utils/usuarioLogado';

function CadastroTipoPerfil() {
    const { idParam } = useParams();
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [carregando, setCarregando] = useState(true);

    const [dadosOriginais, setDadosOriginais] = useState(null);
    const [isProprioPerfil, setIsProprioPerfil] = useState(false);

    function restaurarDados() {
        if (!dadosOriginais) {
            setIsAdmin(false);
            return;
        }
        setIsAdmin(dadosOriginais.admin === true);
    }

    async function salvar() {
        const idValido = idParam && !isNaN(Number(idParam)) && idParam !== 'undefined';
        if (!idValido) {
            mensagemErro('Não foi possível identificar o ID deste cliente para atualização.');
            return;
        }

        if (isProprioPerfil && !isAdmin) {
            mensagemErro('Segurança do Sistema: Você não pode remover seus próprios privilégios de Administrador.');
            return;
        }

        const payload = {
            admin: isAdmin
        };

        try {
            await api.patch(`/clientes/${idParam}`, payload);
            
            mensagemSucesso('Tipo de perfil updated com sucesso!');
            navigate('/listagem-clientes');
        } catch (error) {
            console.error(error);
            const mensagemDoServidor = error?.response?.data?.message || error?.response?.data;
            mensagemErro(mensagemDoServidor || 'Erro ao alterar o tipo de perfil');
        }
    }

    useEffect(() => {
        async function inicializarComponente() {
            const usuarioLogado = obterUsuarioLogado();
            if (usuarioLogado?.admin !== true) {
                mensagemErro('Acesso negado: Operação exclusiva para administradores.');
                navigate('/');
                return;
            }

            const idValido = idParam && !isNaN(Number(idParam)) && idParam !== 'undefined';
            if (!idValido) {
                mensagemErro('ID de cliente inválido ou não fornecido.');
                setCarregando(false);
                return;
            }

            if (usuarioLogado && usuarioLogado.id === Number(idParam)) {
                setIsProprioPerfil(true);
            }

            setCarregando(false);
            try {
                const response = await api.get(`/clientes/${idParam}`);
                const cliente = response.data;

                if (cliente) {
                    setDadosOriginais(cliente);
                    setNome(cliente.nome ?? '');
                    setEmail(cliente.email ?? '');
                    setIsAdmin(cliente.admin === true);
                } else {
                    mensagemErro('Cliente não encontrado.');
                }
            } catch (error) {
                console.error('Erro ao buscar dados do cliente:', error);
                mensagemErro('Erro ao inicializar os dados da tela.');
            } finally {
                setCarregando(false);
            }
        }

        inicializarComponente();
        // eslint-disable-next-line
    }, [idParam]);

    if (carregando) {
        return (
            <div className="container mt-5 text-center">
                <p>Carregando dados do perfil...</p>
            </div>
        );
    }

    return (
        <div className='container'>
            <Card title="Alterar Tipo de Perfil" icon="bi bi-shield-lock">
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <p className='text-muted'>
                                Alterando privilégios do usuário: <strong>{nome}</strong> ({email})
                            </p>

                            {isProprioPerfil && (
                                <div className="alert alert-warning p-2 small" role="alert">
                                    <i className="bi bi-excluir-circle-fill me-2"></i>
                                    Este é o seu usuário atual. Você não pode rebaixar o seu próprio nível de acesso.
                                </div>
                            )}

                            <FormGroup label='Perfil do Usuário: *' htmlFor='selectTipoPerfil'>
                                <select
                                    className='form-select'
                                    id='selectTipoPerfil'
                                    value={String(isAdmin)}
                                    disabled={isProprioPerfil}
                                    onChange={(e) => setIsAdmin(e.target.value === 'true')}
                                >
                                    <option value="false">Usuário Comum (Acesso Padrão)</option>
                                    <option value="true">Administrador (Acesso Total)</option>
                                </select>
                                <small className="form-text text-muted">
                                    * Perfis de administradores possuem acesso irrestrito às listagens gerenciais do sistema.
                                </small>
                            </FormGroup>

                            <Stack spacing={1} padding={1} direction='row' className="mt-4">
                                <button
                                    onClick={salvar}
                                    type='button'
                                    className='btn btn-success'
                                    disabled={isProprioPerfil}
                                >
                                    Salvar Alteração
                                </button>

                                <button
                                    onClick={restaurarDados}
                                    type='button'
                                    className='btn btn-warning'
                                    disabled={isProprioPerfil}
                                >
                                    Restaurar
                                </button>

                                <button
                                    onClick={() => navigate('/listagem-clientes')}
                                    type='button'
                                    className='btn btn-danger'
                                >
                                    {isProprioPerfil ? 'Voltar' : 'Cancelar'}
                                </button>
                            </Stack>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default CadastroTipoPerfil;