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

  const [dadosOriginais, setDadosOriginais] = useState(null);

  function restaurarDados() {
    if (!dadosOriginais) {
      setId('');
      setNome('');
      setValor('');
      setDataAlvo('');
      setInvestimentoInicial('');
      return;
    }

    setId(dadosOriginais.id ?? '');
    setNome(dadosOriginais.nome ?? '');
    setValor(dadosOriginais.valor ?? '');
    setDataAlvo(dadosOriginais.dataAlvo ?? '');
    setInvestimentoInicial(dadosOriginais.investimentoInicial ?? '');
  }

  async function salvar() {
    const payload = { id, nome, valor, dataAlvo, investimentoInicial };

    try {
      if (!idParam) {
        await axios.post(baseURL, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        mensagemSucesso(`Meta ${nome} cadastrada com sucesso!`);
      } else {
        await axios.put(`${baseURL}/${idParam}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        mensagemSucesso(`Meta ${nome} alterada com sucesso!`);
      }

      navigate('/listagem-metas');
    } catch (error) {
      mensagemErro(error?.response?.data || 'Erro ao salvar meta');
    }
  }

  async function buscar() {
    if (!idParam) return;

    try {
      const response = await axios.get(`${baseURL}/${idParam}`);
      const data = response.data;

      setDadosOriginais(data);

      setId(data.id ?? '');
      setNome(data.nome ?? '');
      setValor(data.valor ?? '');
      setDataAlvo(data.dataAlvo ?? '');
      setInvestimentoInicial(data.investimentoInicial ?? '');
    } catch (error) {
      mensagemErro(error?.response?.data || 'Erro ao buscar meta');
    }
  }

  useEffect(() => {
    buscar();
  }, [idParam]);

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
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Valor-Alvo: *' htmlFor='inputValor'>
                <input
                  type='text'
                  id='inputValor'
                  value={valor}
                  className='form-control'
                  onChange={(e) => setValor(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Data-Alvo: *' htmlFor='inputDataAlvo'>
                <input
                  type='month'
                  id='inputDataAlvo'
                  value={dataAlvo}
                  className='form-control'
                  onChange={(e) => setDataAlvo(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Investimento inicial:' htmlFor='inputInvestimentoInicial'>
                <input
                  type='text'
                  id='inputInvestimentoInicial'
                  value={investimentoInicial}
                  className='form-control'
                  onChange={(e) => setInvestimentoInicial(e.target.value)}
                />
              </FormGroup>

              <Stack spacing={1} padding={1} direction='row'>
                <button onClick={salvar} type='button' className='btn btn-success'>
                  Salvar
                </button>
                <button onClick={restaurarDados} type='button' className='btn btn-warning'>
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

export default CadastroMeta;