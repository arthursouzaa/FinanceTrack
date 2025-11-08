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
  const [idMetaFinanceira, setIdMetaFinanceira] = useState(''); // renamed from idMeta
  const [dadosMetas, setDadosMetas] = useState([]); // initialize as empty array
  const [loading, setLoading] = useState(true);

  // Load metas on mount
  useEffect(() => {
    let mounted = true;
    
    async function carregarMetas() {
      try {
        const response = await axios.get(`${BASE_URL}/MetaFinanceira`);
        if (mounted) {
          setDadosMetas(response.data || []);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        mensagemErro('Erro ao carregar metas financeiras');
      }
    }

    carregarMetas();
    return () => { mounted = false };
  }, []);

  // Load existing aporte when editing
  useEffect(() => {
    if (!idParam) {
      inicializar();
      return;
    }

    let mounted = true;

    async function buscar() {
      try {
        const response = await axios.get(`${baseURL}/${idParam}`);
        if (!mounted) return;
        
        const data = response.data;
        setId(data.id);
        setValor(data.valor);
        setIdMetaFinanceira(data.idMetaFinanceira);
      } catch (error) {
        console.error(error);
        mensagemErro('Erro ao carregar aporte');
      }
    }

    buscar();
    return () => { mounted = false };
  }, [idParam, baseURL]);

  function inicializar() {
    setId('');
    setValor('');
    setIdMetaFinanceira('');
  }

  async function salvar() {
    try {
      if (!valor || !idMetaFinanceira) {
        mensagemErro('Preencha todos os campos obrigatórios');
        return;
      }

      const payload = {
        valor: Number(valor),
        idMetaFinanceira: Number(idMetaFinanceira)
      };

      if (!idParam) {
        await axios.post(baseURL, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        mensagemSucesso('Aporte cadastrado com sucesso!');
      } else {
        await axios.put(`${baseURL}/${idParam}`, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        mensagemSucesso('Aporte alterado com sucesso!');
      }

      navigate('/listagem-metas');
    } catch (error) {
      console.error(error);
      mensagemErro(error?.response?.data || 'Erro ao salvar aporte');
    }
  }

  if (loading) {
    return (
      <div className='container'>
        <Card title='Cadastro de Aporte'>
          <div>Carregando...</div>
        </Card>
      </div>
    );
  }

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
                  name='valor'
                  onChange={(e) => setValor(e.target.value)}
                  step='0.01'
                  min='0'
                />
              </FormGroup>
              <FormGroup label='Meta Financeira: *' htmlFor='selectMeta'>
                <select
                  className='form-select'
                  id='selectMeta'
                  name='idMetaFinanceira'
                  value={idMetaFinanceira}
                  onChange={(e) => setIdMetaFinanceira(e.target.value)}
                >
                  <option value=''>Selecione uma meta...</option>
                  {dadosMetas.map((meta) => (
                    <option key={meta.id} value={meta.id}>
                      {meta.nome}
                    </option>
                  ))}
                </select>
              </FormGroup>
              <Stack spacing={1} padding={1} direction='row'>
                <button onClick={salvar} type='button' className='btn btn-success'>
                  Salvar
                </button>
                <button onClick={inicializar} type='button' className='btn btn-danger'>
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
