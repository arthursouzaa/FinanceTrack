import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL } from '../config/axios';
import { obterIdUsuarioLogado, salvarUsuarioLogado } from '../utils/usuarioLogado';


function ListagemPerfil() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/clientes`;
    const idUsuarioLogado = obterIdUsuarioLogado();

    // Usar idParam se fornecido, senão usar ID do usuário logado
    const idParaCarregar = idParam ?? idUsuarioLogado;

    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [carregando, setCarregando] = useState(true);

    async function salvar() {
        // 1. Validações iniciais
        if (novaSenha && novaSenha !== confirmarSenha) {
            mensagemErro('As senhas não coincidem');
            return;
        }

        if (!idParaCarregar) {
            mensagemErro('Não foi possível identificar o usuário logado');
            return;
        }

        // 2. Montagem do objeto de dados
        const data = {
            id: idParaCarregar,
            nome,
            telefone,
            email,
        };

        // Só adiciona a senha ao objeto se o usuário realmente digitou uma nova
        if (novaSenha) {
            data.senha = novaSenha;
            data.senhaConfirmada = confirmarSenha;
        }

        // 3. Requisição para a API
        try {
            // Removido o document.write que quebrava a tela
            console.log(`Enviando para: ${baseURL}/${idParaCarregar}`, data);

            await axios.put(`${baseURL}/${idParaCarregar}`, data, {
                headers: { 'Content-Type': 'application/json' },
            });

            mensagemSucesso('Perfil atualizado com sucesso!');

            // Atualizar usuário na localStorage
            salvarUsuarioLogado({ id: idParaCarregar, nome, telefone, email });

            // Redirecionar o usuário
            navigate('/');
        } catch (error) {
            mensagemErro('Erro ao atualizar perfil');
            console.error(error);
        }
    }

    useEffect(() => {
        async function carregarDados() {
            try {
                if (!idParaCarregar) {
                    mensagemErro('Nenhum usuário para carregar');
                    setCarregando(false);
                    return;
                }

                const response = await axios.get(`${baseURL}/${idParaCarregar}`);
                const dados = response.data;

                if (!dados) {
                    mensagemErro('Usuário não encontrado');
                    setCarregando(false);
                    return;
                }

                // Salvar na localStorage para manter autenticação
                salvarUsuarioLogado(dados);

                // Preencher formulário
                setId(dados.id ?? '');
                setNome(dados.nome ?? '');
                setTelefone(dados.telefone ?? '');
                setEmail(dados.email ?? '');
                setNovaSenha('');
                setConfirmarSenha('');
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
                mensagemErro('Erro ao carregar dados do perfil');
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
        // eslint-disable-next-line
    }, [idParaCarregar]);

    return (
        <div className='container'>
            <Card title='Editar Perfil' icon="bi bi-person-circle">
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            {carregando ? (
                                <p className='text-center'>Carregando dados...</p>
                            ) : (
                                <>
                                    <p className='text-muted'>Aqui você encontra seus dados pessoais! Você pode editar suas informações 📝</p>

                                    <FormGroup label='Nome:' htmlFor='inputNome'>
                                        <input
                                            type='text'
                                            id='inputNome'
                                            value={nome}
                                            className='form-control'
                                            onChange={(e) => setNome(e.target.value)}
                                        />
                                    </FormGroup>

                                    <FormGroup label='Telefone:' htmlFor='inputTelefone'>
                                        <input
                                            type='text'
                                            id='inputTelefone'
                                            value={telefone}
                                            className='form-control'
                                            onChange={(e) => setTelefone(e.target.value)}
                                        />
                                    </FormGroup>

                                    <FormGroup label='E-mail:' htmlFor='inputEmail'>
                                        <input
                                            type='email'
                                            id='inputEmail'
                                            value={email}
                                            className='form-control'
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </FormGroup>

                                    <hr />

                                    <p className='text-muted'>Aqui você pode alterar sua senha! Escolha uma senha segura🔒</p>

                                    <FormGroup label='Nova senha:' htmlFor='inputNovaSenha'>
                                        <input
                                            type='password'
                                            id='inputNovaSenha'
                                            value={novaSenha}
                                            className='form-control'
                                            placeholder='Deixe em branco para manter a senha atual'
                                            onChange={(e) => setNovaSenha(e.target.value)}
                                        />
                                    </FormGroup>

                                    <FormGroup label='Confirmar senha:' htmlFor='inputConfirmarSenha'>
                                        <input
                                            type='password'
                                            id='inputConfirmarSenha'
                                            value={confirmarSenha}
                                            className='form-control'
                                            placeholder='Deixe em branco para manter a senha atual'
                                            onChange={(e) => setConfirmarSenha(e.target.value)}
                                        />
                                    </FormGroup>

                                    <Stack spacing={1} padding={1} direction='row'>
                                        <button
                                            onClick={salvar}
                                            type='button'
                                            className='btn btn-success'
                                        >
                                            Salvar
                                        </button>
                                        <button
                                            onClick={() => navigate('/')}
                                            type='button'
                                            className='btn btn-danger'
                                        >
                                            Cancelar
                                        </button>
                                    </Stack>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default ListagemPerfil;
