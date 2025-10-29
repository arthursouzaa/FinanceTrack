import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL } from '../config/axios';

function CadastroMeta() {
  const { idParam } = useParams();

  const navigate = useNavigate();

  const baseURL = `${BASE_URL}/MetaFinanceira`;

  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [dataAlvo, setDataAlvo] = useState('');
  const [investimentoInicial, setInvestimentoInicial] = useState('');

  const [dados, setDados] = React.useState([]);

  function inicializar() {
    if (idParam == null) {
      setId('');
      setNome('');
      setValor('');
      setDataAlvo('');
      setInvestimentoInicial('');
    } else {
      setId(dados.id);
      setNome(dados.nome);
      setValor(dados.valor);
      setDataAlvo(dados.dataAlvo);
      setInvestimentoInicial(dados.investimentoInicial);
    }
  }

  async function salvar() {
    let data = { id, nome, valor, dataAlvo, investimentoInicial };
    data = JSON.stringify(data);
    if (idParam == null) {
      await axios
        .post(baseURL, data, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(function (response) {
          mensagemSucesso(`Meta ${nome} cadastrado com sucesso!`);
          navigate(`/listagem-metas`);
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
          mensagemSucesso(`Meta ${nome} alterado com sucesso!`);
          navigate(`/listagem-meta`);
        })
        .catch(function (error) {
          mensagemErro(error.response.data);
        });
    }
  }

  async function buscar() {
    await axios.get(`${baseURL}/${idParam}`).then((response) => {
      setDados(response.data);
    });
    setId(dados.id);
    setNome(dados.nome);
    setValor(dados.valor);
    setDataAlvo(dados.dataAlvo);
    setInvestimentoInicial(dados.investimentoInicial);
  }

    return (
    <div className='container'>
      <Card title='Cadastro de Meta'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
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
              <FormGroup label='Valor-Alvo: *' htmlFor='inputValor'>
                <input
                  type='text'
                  id='inputValor'
                  value={valor}
                  className='form-control'
                  name='valor'
                  onChange={(e) => setValor(e.target.value)}
                />
              </FormGroup>
              <FormGroup label='Data-Alvo: *' htmlFor='inputDataAlvo'>
                <input
                  type='month'
                  id='inputDataAlvo'
                  value={dataAlvo}
                  className='form-control'
                  name='dataAlvo'
                  onChange={(e) => setDataAlvo(e.target.value)}
                />
              </FormGroup>
              <FormGroup label='InvestimentoInicial:' htmlFor='inputInvestimentoInicial'>
                <input
                  type='text'
                  id='inputInvestimentoIni'
                  value={investimentoInicial}
                  className='form-control'
                  name='investimentoInicial'
                  onChange={(e) => setInvestimentoInicial(e.target.value)}
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

export default CadastroMeta;
