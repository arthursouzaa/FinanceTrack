import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL2 } from '../config/axios';

function CadastroLancamento() {
    const { idParam } = useParams();

    const navigate = useNavigate();

    const baseURL = `${BASE_URL2}/Receita`;

    const [id, setId] = useState('');
    const [tipo, setTipo] = useState('receita');
    const [nome, setNome] = useState('');
    const [date, setData] = useState('');
    const [idCategoriaReceita, setIdCategoriaReceita] = useState(0);
    const [volume, setVolume] = useState(false);
    const [valor, setValor] = useState('');

    const [dados, setDados] = React.useState([]);

    function inicializar() {
        if (idParam == null) {
            setId('');
            setTipo('');
            setNome('');
            setData('');
            setIdCategoriaReceita('');
            setVolume(false);
            setValor('');
        } else {
            setId(dados.id);
            setTipo(dados.tipo);
            setNome(dados.nome);
            setData(dados.date);
            setIdCategoriaReceita(dados.idCategoriaReceita);
            setVolume(dados.volume);
            setValor(dados.valor);
        }
    }

    async function salvar() {
        let data = { id, tipo, nome, date, idCategoriaReceita, volume, valor };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Lancamento cadastrado com sucesso!`);
                    navigate(`/listagem-lancamentos`);
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
                    mensagemSucesso(`Lancamento alterado com sucesso!`);
                    navigate(`/listagem-lancamentos`);
                })
                .catch(function (error) {
                    mensagemErro(error.response.data);
                });
        }
    }

    async function buscar() {
        if (idParam) {
            await axios.get(`${baseURL}/${idParam}`).then((response) => {
                setDados(response.data);
            });
            setId(dados.id);
            setTipo(dados.tipo);
            setNome(dados.nome);
            setData(dados.date);
            setIdCategoriaReceita(dados.idCategoriaReceita);
            setVolume(dados.volume);
            setValor(dados.valor);
        }
    }

    const [dadosCategoriasReceita, setDadosCategoriasReceita] = React.useState(null);

    useEffect(() => {
        axios.get(`${BASE_URL2}/CategoriaReceita`).then((response) => {
            setDadosCategoriasReceita(response.data);
        });
    }, []);

    useEffect(() => {
        buscar(); // eslint-disable-next-line
    }, [id]);

    if (!dados) return null;
    if (!dadosCategoriasReceita) return null;

    return (
        <div className='container'>
            <Card title='Cadastro de Lancamento'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Tipo:' htmlFor='tipoReceita'>
                                <div>
                                    <label>
                                        <input
                                            type='radio'
                                            id='tipoReceita'
                                            name='tipo'
                                            value='receita'
                                            onChange={(e) => setTipo(e.target.value)}
                                        />
                                        Receita
                                    </label>
                                    <label>
                                        <input
                                            type='radio'
                                            id='tipoDespesa'
                                            name='tipo'
                                            value='despesa'
                                            onChange={(e) => setTipo(e.target.value)}
                                        />
                                        Despesa
                                    </label>
                                </div>
                            </FormGroup>
                            <FormGroup label='Nome: *' htmlFor='inputNome'>
                                <input
                                    type='text'
                                    id='inputNome'
                                    value={nome}
                                    className='form-control'
                                    name='nome'
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Data: *' htmlFor='inputData'>
                                <input
                                    type='date'
                                    id='inputData'
                                    value={date}
                                    className='form-control'
                                    name='date'
                                    onChange={(e) => setData(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Categoria de Receita' htmlFor='selectCategoriaReceita'>
                                <select
                                    className='form-select'
                                    id='selectCategoriasReceita'
                                    name='idCategoriaReceita'
                                    value={idCategoriaReceita}
                                    onChange={(e) => setIdCategoriaReceita(e.target.value)}
                                >
                                    <option key='0' value='0'>
                                        {' '}
                                    </option>
                                    {dadosCategoriasReceita.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {dado.nome}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                            <FormGroup label='Volume: ' htmlFor='inputVolume'>
                                <input
                                    type='checkbox'
                                    id='inputVolume'
                                    value={volume}
                                    name='volume'
                                    onChange={(e) => setVolume(e.target.value)}
                                /> Fixa
                            </FormGroup>
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

export default CadastroLancamento;
