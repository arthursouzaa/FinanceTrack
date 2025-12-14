import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL } from '../config/axios';

function CadastroAporte() {
    const { idParam } = useParams();
    const navigate = useNavigate();

    const baseURL = `${BASE_URL}/Aporte`;

    const [id, setId] = useState('');
    const [valor, setValor] = useState('');
    const [idMetaFinanceira, setIdMetaFinanceira] = useState('');

    const [dadosOriginais, setDadosOriginais] = useState(null);
    const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = useState(null);

    function restaurarDados() {
        if (!dadosOriginais) {
            setId('');
            setValor('');
            setIdMetaFinanceira('');
            return;
        }

        setId(dadosOriginais.id ?? '');
        setValor(dadosOriginais.valor ?? '');
        setIdMetaFinanceira(
            dadosOriginais.idMetaFinanceira
                ? String(dadosOriginais.idMetaFinanceira)
                : ''
        );
    }

    async function salvar() {
        const data = JSON.stringify({
            id,
            valor,
            idMetaFinanceira: idMetaFinanceira || null
        });

        try {
            if (!idParam) {
                await axios.post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                });
                mensagemSucesso('Aporte cadastrado com sucesso!');
            } else {
                await axios.put(`${baseURL}/${idParam}`, data, {
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
        if (!idParam) return;

        try {
            const response = await axios.get(`${baseURL}/${idParam}`);
            const data = response.data;

            setDadosOriginais(data);

            setId(data.id ?? '');
            setValor(data.valor ?? '');
            setIdMetaFinanceira(
                data.idMetaFinanceira ? String(data.idMetaFinanceira) : ''
            );
        } catch (error) {
            mensagemErro('Erro ao buscar aporte');
        }
    }

    async function buscarMetasFinanceiras() {
        try {
            const response = await axios.get(`${BASE_URL}/MetaFinanceira`);
            setDadosMetasFinanceiras(response.data);
        } catch (error) {
            mensagemErro('Erro ao carregar metas financeiras');
        }
    }

    useEffect(() => {
        buscarMetasFinanceiras();
        buscarAporte();
        // eslint-disable-next-line
    }, []);

    if (!dadosMetasFinanceiras) return null;

    return (
        <div className='container'>
            <Card title='Cadastro de Aporte'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>

                            <FormGroup label='Valor: *' htmlFor='inputValor'>
                                <input
                                    type='number'
                                    id='inputValor'
                                    value={valor}
                                    className='form-control'
                                    onChange={(e) => setValor(e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup label='Meta Financeira:' htmlFor='selectMetaFinanceira'>
                                <select
                                    className='form-select'
                                    id='selectMetaFinanceira'
                                    value={idMetaFinanceira}
                                    onChange={(e) => setIdMetaFinanceira(e.target.value)}
                                >
                                    <option value=''></option>
                                    {dadosMetasFinanceiras.map((meta) => (
                                        <option key={meta.id} value={meta.id}>
                                            {meta.nome}
                                        </option>
                                    ))}
                                </select>
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
                                    onClick={restaurarDados}
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

export default CadastroAporte;
