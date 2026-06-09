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
    const [idPerfil, setIdPerfil] = useState(idParam ?? idUsuarioLogado);


    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [dadosOriginais, setDadosOriginais] = useState(null);

    function inicializar() {
        if (!dadosOriginais) return;

        setId(dadosOriginais.id ?? '');
        setNome(dadosOriginais.nome ?? '');
        setTelefone(dadosOriginais.telefone ?? '');
        setEmail(dadosOriginais.email ?? '');
        setNovaSenha('');
        setConfirmarSenha('');
    }

    async function salvar() {
        if (novaSenha && novaSenha !== confirmarSenha) {
            mensagemErro('As senhas não coincidem');
            return;
        }

        if (!idPerfil) {
            mensagemErro('Não foi possível identificar o usuário logado');
            return;
        }

        const data = {
            id,
            nome,
            telefone,
            email,
            senha: novaSenha || '123456'
        };

        try {
            await axios.put(`${baseURL}/${idPerfil}`, data, {
                headers: { 'Content-Type': 'application/json' },
            });

            mensagemSucesso('Perfil atualizado com sucesso!');

            navigate('/');
        } catch (error) {
            mensagemErro('Erro ao atualizar perfil');
        }
    }

    async function buscar() {
        try {
            const response = idParam || idPerfil
                ? await axios.get(`${baseURL}/${idParam ?? idPerfil}`)
                : await axios.get(baseURL);

            const data = Array.isArray(response.data) ? response.data[0] : response.data;

            if (!data) {
                mensagemErro('Nenhum usuário foi encontrado para carregar o perfil');
                return;
            }

            const usuario = salvarUsuarioLogado(data);
            const idAtual = usuario?.id ?? data.id ?? '';

            setDadosOriginais(data);

            setId(idAtual);
            setIdPerfil(idAtual);
            setNome(data.nome ?? '');
            setTelefone(data.telefone ?? '');
            setEmail(data.email ?? '');
            setNovaSenha('');
            setConfirmarSenha('');
        } catch (error) {
            if (error?.response?.status === 404) {
                try {
                    const listResponse = await axios.get(baseURL);
                    const listaClientes = Array.isArray(listResponse.data) ? listResponse.data : [];
                    const primeiroCliente = listaClientes[0];

                    if (!primeiroCliente) {
                        mensagemErro('Nenhum usuário foi encontrado para carregar o perfil');
                        return;
                    }

                    const usuario = salvarUsuarioLogado(primeiroCliente);
                    const idAtual = usuario?.id ?? primeiroCliente.id ?? '';

                    setDadosOriginais(primeiroCliente);
                    setId(idAtual);
                    setIdPerfil(idAtual);
                    setNome(primeiroCliente.nome ?? '');
                    setTelefone(primeiroCliente.telefone ?? '');
                    setEmail(primeiroCliente.email ?? '');
                    setNovaSenha('');
                    setConfirmarSenha('');
                    return;
                } catch {
                    mensagemErro('Erro ao carregar dados do perfil');
                    return;
                }
            }

            mensagemErro('Erro ao carregar dados do perfil');
        }
    }

    useEffect(() => {
        buscar();
        // eslint-disable-next-line
    }, [idParam]);

    return (
        <div className='container'>
            <Card title='Editar Perfil' icon="bi bi-person-circle">
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
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
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup label='Confirmar senha:' htmlFor='inputConfirmarSenha'>
                                <input
                                    type='password'
                                    id='inputConfirmarSenha'
                                    value={confirmarSenha}
                                    className='form-control'
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
                                    onClick={inicializar}
                                    type='button'
                                    className='btn btn-warning'
                                >
                                    Restaurar
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    type='button'
                                    className='btn btn-danger'
                                >
                                    Cancelar
                                </button>
                            </Stack>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default ListagemPerfil;
