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

    const [dados, setDados] = React.useState([]);

    function inicializar() {
        if (idParam == null) {
            setId('');
            setValor('');
            setIdMetaFinanceira('');
        } else {
            setId(dados.id);
            setValor(dados.valor);
            setIdMetaFinanceira(dados.idMetaFinanceira);
        }
    }

    async function salvar() {
        let data = { id, valor, idMetaFinanceira };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Aporte cadastrado com sucesso!`);
                    navigate(`/listagem-aportes`);
                })
                .catch(function (error) {
                    mensagemErro(error.response.data);
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Aporte alterado com sucesso!`);
                    navigate(`/listagem-aportes`);
                })
                .catch(function (error) {
                    mensagemErro(error.response.data);
                });
        }
    }

    async function buscar() {
        if (idParam) {
            try {
                const response = await axios.get(`${baseURL}/${idParam}`);
                const dados = response.data;
                setDados(dados);
                // popula diretamente com os valores da resposta (normaliza id como string)
                setId(dados.id ?? idParam);
                setValor(dados.valor ?? '');
                setIdMetaFinanceira(dados.idMetaFinanceira);
                if (idMetaFinanceira != null) setIdMetaFinanceira(String(dados.idMetaFinanceira));
            } catch (err) {
                mensagemErro('Erro ao buscar aporte');
            }
        }
    }

    const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = React.useState(null);

    useEffect(() => {
        axios.get(`${BASE_URL}/MetaFinanceira`).then((response) => {
            setDadosMetasFinanceiras(response.data);
        });
    }, []);

    useEffect(() => {
        buscar(); // eslint-disable-next-line
    }, [id]);

    if (!dados) return null;
    if (!dadosMetasFinanceiras) return null;

    return (
        <div className='container'>
            <Card title='Cadastro de Aporte'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Valor: *' htmlFor='inputValor'>
                                <input
                                    type='valor'
                                    id='inputValor'
                                    value={valor}
                                    className='form-control'
                                    name='valor'
                                    onChange={(e) => setValor(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Meta Financeira: ' htmlFor='selectMetaFinanceira'>
                                <select
                                    className='form-select'
                                    id='selectMetasFinanceiras'
                                    name='idMetaFinanceira'
                                    value={idMetaFinanceira}
                                    onChange={(e) => setIdMetaFinanceira(e.target.value)}
                                >
                                    <option key='0' value='0'>
                                        {' '}
                                    </option>
                                    {dadosMetasFinanceiras.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {dado.nome}
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
                                    onClick={inicializar}
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
