import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';
import '../custom.css';

import axios from 'axios';
import { BASE_URL } from '../config/axios';
import { filtrarRegistrosDoUsuario } from '../utils/usuarioLogado';

function CadastroAporte() {
    // Captura o ID da URL de forma segura
    const idParam = window.location.pathname.split('/').pop() !== 'cadastro-aportes'
        ? window.location.pathname.split('/').pop()
        : undefined;

    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/aportes`;

    const [id, setId] = useState('');
    const [valor, setValor] = useState('');
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [idMetaFinanceira, setIdMetaFinanceira] = useState('');

    const [dadosOriginais, setDadosOriginais] = useState(null);
    const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = useState([]);

    // Helper para garantir que a data do backend caia perfeitamente no formato "YYYY-MM-DD" do input
    const formatarParaInputData = (dataIso) => {
        if (!dataIso) return '';
        return dataIso.split('T')[0];
    };

    function restaurarDados() {
        if (!dadosOriginais) {
            setId('');
            setValor('');
            setData(new Date().toISOString().split('T')[0]);
            setIdMetaFinanceira('');
            return;
        }

        setId(dadosOriginais.id ?? '');
        setValor(dadosOriginais.valor ?? '');
        setData(formatarParaInputData(dadosOriginais.data ?? dadosOriginais.dataAporte));
        setIdMetaFinanceira(
            dadosOriginais.idMetaFinanceira
                ? String(dadosOriginais.idMetaFinanceira)
                : ''
        );
    }

    async function salvar() {
        if (!valor || !data || !idMetaFinanceira) {
            mensagemErro('Por favor, preencha todos os campos obrigatórios (*)');
            return;
        }

        // Monta o payload como objeto nativo (o Axios transforma em string JSON automaticamente)
        const payload = {
            valor: Number(valor),
            data: data.includes('T') ? data : `${data}T00:00:00.000Z`, // Salva em ISO neutro
            idMetaFinanceira: Number(idMetaFinanceira)
        };

        // Se for edição, injeta o ID no corpo
        if (idParam) {
            payload.id = Number(idParam);
        }

        try {
            if (!idParam) {
                await axios.post(baseURL, payload, {
                    headers: { 'Content-Type': 'application/json' },
                });
                mensagemSucesso('Aporte cadastrado com sucesso!');
            } else {
                await axios.put(`${baseURL}/${idParam}`, payload, {
                    headers: { 'Content-Type': 'application/json' },
                });
                mensagemSucesso('Aporte alterado com sucesso!');
            }

            navigate('/listagem-aportes');
        } catch (error) {
            mensagemErro(error?.response?.data || 'Erro ao salvar aporte');
        }
    }

    async function buscarAporte() {
        if (!idParam || idParam === 'undefined') return;

        try {
            const response = await axios.get(`${baseURL}/${idParam}`);
            const payload = response.data;

            setDadosOriginais(payload);

            setId(payload.id ?? '');
            setValor(payload.valor ?? '');
            setData(formatarParaInputData(payload.data ?? payload.dataAporte));
            setIdMetaFinanceira(
                payload.idMetaFinanceira ? String(payload.idMetaFinanceira) : ''
            );
        } catch (error) {
            mensagemErro('Erro ao buscar aporte');
        }
    }

    async function buscarMetasFinanceiras() {
        try {
            const response = await axios.get(`${BASE_URL}/metasFinanceiras`);
            // CRUCIAL: Filtra para o select exibir APENAS as metas do usuário logado
            setDadosMetasFinanceiras(filtrarRegistrosDoUsuario(response.data));
        } catch (error) {
            mensagemErro('Erro ao carregar metas financeiras');
        }
    }

    useEffect(() => {
        buscarMetasFinanceiras();
        buscarAporte();
        // eslint-disable-next-line
    }, [idParam]);

    return (
        <div className='container'>
            <Card title={idParam ? 'Editar Aporte' : 'Cadastro de Aporte'} icon="bi bi-cash">
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>

                            <FormGroup label='Valor: *' htmlFor='inputValor'>
                                <input
                                    type='number'
                                    id='inputValor'
                                    value={valor}
                                    placeholder="0.00"
                                    step="0.01"
                                    className='form-control'
                                    onChange={(e) => setValor(e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup label='Data: *' htmlFor='inputData'>
                                <input
                                    type='date'
                                    id='inputData'
                                    value={data}
                                    className='form-control'
                                    onChange={(e) => setData(e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup label='Meta Financeira: *' htmlFor='selectMetaFinanceira'>
                                <select
                                    className='form-select'
                                    id='selectMetaFinanceira'
                                    value={idMetaFinanceira}
                                    onChange={(e) => setIdMetaFinanceira(e.target.value)}
                                >
                                    <option value=''>Selecione uma meta...</option>
                                    {dadosMetasFinanceiras.map((meta) => (
                                        <option key={meta.id} value={meta.id}>
                                            {meta.nome}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>

                            <Stack spacing={1} padding={1} direction='row' className="mt-3">
                                <button
                                    onClick={salvar}
                                    type='button'
                                    className='btn btn-success'
                                >
                                    Salvar
                                </button>

                                <button
                                    onClick={restaurarDados}
                                    type='button'
                                    className='btn btn-warning'
                                >
                                    Restaurar
                                </button>

                                <button
                                    onClick={() => navigate('/listagem-aportes')}
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

export default CadastroAporte;