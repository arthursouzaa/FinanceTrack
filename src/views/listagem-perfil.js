import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import api from '../config/axios';
import { obterIdUsuarioLogado, salvarUsuarioLogado } from '../utils/usuarioLogado';

function ListagemPerfil() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const idUsuarioLogado = obterIdUsuarioLogado();

    const obterIdValido = () => {
        if (idParam && !isNaN(Number(idParam)) && idParam !== 'undefined') {
            return Number(idParam);
        }
        if (idUsuarioLogado && !isNaN(Number(idUsuarioLogado)) && idUsuarioLogado !== 'undefined') {
            return Number(idUsuarioLogado);
        }
        return null;
    };

    const idParaCarregar = obterIdValido();

    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [carregando, setCarregando] = useState(true);
    
    const [dadosOriginais, setDadosOriginais] = useState(null); 

    async function salvar() {
        if (!nome || !email) {
            mensagemErro('Os campos Nome e E-mail são obrigatórios.');
            return;
        }

        const numerosTelefone = telefone ? telefone.replace(/\D/g, '') : '';
        if (numerosTelefone && (numerosTelefone.length < 10 || numerosTelefone.length > 11)) {
            mensagemErro('Por favor, insira um telefone válido com DDD (10 ou 11 dígitos).');
            return;
        }

        if (novaSenha && novaSenha !== confirmarSenha) {
            mensagemErro('As senhas não coincidem.');
            return;
        }

        if (!idParaCarregar) {
            mensagemErro('Não foi possível identificar o usuário logado.');
            return;
        }

        const ehAdminOriginalmente = dadosOriginais?.admin === true;

        const data = {
            id: idParaCarregar,
            nome: nome.trim(),
            telefone,
            email: email.trim(),
            admin: ehAdminOriginalmente 
        };

        if (novaSenha) {
            data.senha = novaSenha;
            data.senhaConfirmada = confirmarSenha;
        }

        try {
            const response = await api.put(`/clientes/${idParaCarregar}`, data);
            const dadosRenovados = response.data; // Espera-se que traga: id, email, admin, token

            localStorage.setItem('_usuario_token', dadosRenovados.token);

            salvarUsuarioLogado({
                id: idParaCarregar,
                nome: nome.trim(),
                telefone,
                email: email.trim(),
                admin: ehAdminOriginalmente 
            });

            mensagemSucesso('Perfil atualizado com sucesso!');
            navigate('/');
        } catch (error) {
            console.error(error);
            const mensagemDoServidor = error?.response?.data?.message || error?.response?.data;
            mensagemErro(mensagemDoServidor || 'Erro ao atualizar perfil');
        }
    }

    const aplicarMascaraTelefone = (valor) => {
        if (!valor) return "";
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

    useEffect(() => {
        async function carregarDados() {
            if (!idParaCarregar) {
                mensagemErro('Nenhum usuário válido identificado para carregar.');
                setCarregando(false);
                return;
            }

            setCarregando(true);
            try {
                const response = await api.get(`/clientes/${idParaCarregar}`);
                const dados = response.data;

                if (!dados) {
                    mensagemErro('Usuário não encontrado no banco de dados.');
                    return;
                }

                setDadosOriginais(dados); 

                setNome(dados.nome ?? '');
                setTelefone(dados.telefone ? aplicarMascaraTelefone(dados.telefone) : '');
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
                                <div className="text-center py-4">
                                    <p>Carregando dados do perfil...</p>
                                </div>
                            ) : (
                                <>
                                    <p className='text-muted'>Aqui você encontra seus dados pessoais! Você pode editar suas informações 📝</p>

                                    <FormGroup label='Nome: *' htmlFor='inputNome'>
                                        <input
                                            type='text'
                                            id='inputNome'
                                            value={nome}
                                            className='form-control'
                                            onChange={(e) => setNome(e.target.value)}
                                        />
                                    </FormGroup>

                                    <FormGroup label='E-mail: *' htmlFor='inputEmail'>
                                        <input
                                            type='email'
                                            id='inputEmail'
                                            value={email}
                                            className='form-control'
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </FormGroup>

                                    <FormGroup label='Telefone:' htmlFor='inputTelefone'>
                                        <input
                                            type='text'
                                            id='inputTelefone'
                                            value={telefone}
                                            className='form-control'
                                            placeholder='(11) 99999-8888'
                                            onChange={(e) => setTelefone(aplicarMascaraTelefone(e.target.value))}
                                        />
                                    </FormGroup>

                                    <hr />

                                    <p className='text-muted'>Aqui você pode alterar sua senha! Escolha uma senha segura 🔒</p>

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

                                    <FormGroup label='Confirmar senha: ' htmlFor='inputConfirmarSenha'>
                                        <input
                                            type='password'
                                            id='inputConfirmarSenha'
                                            value={confirmarSenha}
                                            className='form-control'
                                            placeholder='Deixe em branco para manter a senha atual'
                                            onChange={(e) => setConfirmarSenha(e.target.value)}
                                        />
                                    </FormGroup>

                                    <Stack spacing={1} paddingY={2} direction='row'>
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