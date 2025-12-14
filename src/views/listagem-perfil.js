import React, { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL } from '../config/axios';

function ListagemPerfil() {
    const navigate = useNavigate();

    const baseURL = `${BASE_URL}/Cliente/1`;

    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [senhaAntiga, setSenhaAntiga] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [dadosOriginais, setDadosOriginais] = useState(null);

    function inicializar() {
        setId(dadosOriginais.id ?? '');
        setNome(dadosOriginais.nome ?? '');
        setTelefone(dadosOriginais.telefone ?? '');
        setEmail(dadosOriginais.email ?? '');
        setSenhaAntiga('');
        setNovaSenha('');
        setConfirmarSenha('');
    }

    async function salvar() {
        if (novaSenha && novaSenha !== confirmarSenha) {
            mensagemErro('As senhas não coincidem');
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
            await axios.put(baseURL, JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' },
            });

            mensagemSucesso('Perfil atualizado com sucesso!');

            navigate('/#');
        } catch (error) {
            mensagemErro('Erro ao atualizar perfil');
        }
    }

    async function buscar() {
        try {
            const response = await axios.get(baseURL);
            const data = response.data;

            setDadosOriginais(data);

            setId(data.id ?? '');
            setNome(data.nome ?? '');
            setTelefone(data.telefone ?? '');
            setEmail(data.email ?? '');
            setNovaSenha('');
            setConfirmarSenha('');
        } catch (error) {
            mensagemErro('Erro ao carregar dados do perfil');
        }
    }

    useEffect(() => {
        buscar();
        // eslint-disable-next-line
    }, []);

    return (
        <div className='container'>
            <Card title='Editar Perfil'>
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
