import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL, BASE_URL2 } from '../config/axios';

const baseReceitas = `${BASE_URL2}/Receita`;
const baseDespesas = `${BASE_URL2}/Despesa`;

function CadastroLancamento() {
  const { idParam } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const tipoQuery = new URLSearchParams(location.search).get('tipo');

  const [id, setId] = useState('');
  const [tipo, setTipo] = useState('Receita');
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [volume, setVolume] = useState(false);
  const [valor, setValor] = useState('');
  const [idFormaPagamento, setIdFormaPagamento] = useState('');
  const [parcelada, setParcelada] = useState(0);

  function inicializar() {
    setId('');
    setTipo('Receita');
    setNome('');
    setData('');
    setIdCategoria('');
    setVolume(false);
    setValor('');
    setIdFormaPagamento('');
    setParcelada(0);
  }

  async function salvar() {
    let data = { id, tipo, nome, data, idCategoria, volume, valor, idFormaPagamento, parcelada };
    try {
      if (!idParam) {
        if (tipo === 'Receita') {
          await axios.post(baseReceitas, data, { headers: { 'Content-Type': 'application/json' } });
        } else {
          await axios.post(baseDespesas, data, { headers: { 'Content-Type': 'application/json' } });
        }
        mensagemSucesso('Lançamento cadastrado com sucesso!');
      } else {
        if (tipo === 'Receita') {
          await axios.put(`${baseReceitas}/${idParam}`, data, { headers: { 'Content-Type': 'application/json' } });
        } else {
          await axios.put(`${baseDespesas}/${idParam}`, data, { headers: { 'Content-Type': 'application/json' } });
        }
        mensagemSucesso('Lançamento alterado com sucesso!');
      }
      navigate('/listagem-lancamentos');
    } catch (error) {
      mensagemErro(error?.response?.data || 'Erro ao salvar lançamento');
    }
  }

  async function buscar() {
    if (idParam) {
      try {
        if (tipoQuery === 'Despesa') {
          const resp = await axios.get(`${baseDespesas}/${idParam}`);
          const data = resp.data;
          setId(data.id ?? idParam);
          setTipo('Despesa');
          setNome(data.nome ?? '');
          setData(data.data ?? '');
          setIdCategoria(data.idCategoria ?? '');
          setVolume(data.volume ?? false);
          setValor(data.valor ?? '');
          setIdFormaPagamento(data.idFormaPagamento ?? '');
          setParcelada(data.parcelada ?? 0);
          return;
        }
        if (tipoQuery === 'Receita') {
          const resp = await axios.get(`${baseReceitas}/${idParam}`);
          const data = resp.data;
          setId(data.id ?? idParam);
          setTipo('Receita');
          setNome(data.nome ?? '');
          setData(data.data ?? '');
          setIdCategoria(data.idCategoria ?? '');
          setVolume(data.volume ?? false);
          return;
        }

        try {
          const response = await axios.get(`${baseReceitas}/${idParam}`);
          const data = response.data;
          setId(data.id ?? idParam);
          setTipo('Receita');
          setNome(data.nome ?? '');
          setData(data.data ?? '');
          setIdCategoria(data.idCategoria ?? '');
          setVolume(data.volume ?? false);
          setValor(data.valor ?? '');
          setIdFormaPagamento(data.idFormaPagamento ?? '');
          setParcelada(data.parcelada ?? 0);
        } catch (errReceita) {
          try {
            const response = await axios.get(`${baseDespesas}/${idParam}`);
            const data = response.data;
            setId(data.id ?? idParam);
            setTipo('Despesa');
            setNome(data.nome ?? '');
            setData(data.data ?? '');
            setIdCategoria(data.idCategoria ?? '');
            setVolume(data.volume ?? false);
            setValor(data.valor ?? '');
            setIdFormaPagamento(data.idFormaPagamento ?? '');
            setParcelada(data.parcelada ?? 0);
          } catch (errDespesa) {
            mensagemErro('Lançamento não encontrado');
          }
        }
      } catch (err) {
        mensagemErro('Erro ao buscar lançamento');
      }
    }
  }

  const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = React.useState(null);
  const [dadosCategoriasReceita, setDadosCategoriasReceita] = React.useState([]);
  const [dadosCategoriasDespesa, setDadosCategoriasDespesa] = React.useState([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/MetaFinanceira`).then((response) => {
      setDadosMetasFinanceiras(response.data);
    });
    axios.get(`${BASE_URL2}/CategoriaReceita`).then((response) => {
      setDadosCategoriasReceita(response.data);
    });
    axios.get(`${BASE_URL2}/CategoriaDespesa`).then((response) => {
      setDadosCategoriasDespesa(response.data);
    });
  }, []);

  useEffect(() => {
    buscar();
    // eslint-disable-next-line
  }, [idParam, tipoQuery]);

  if (!dadosMetasFinanceiras) return null;
  if (!dadosCategoriasReceita) return null;
  if (!dadosCategoriasDespesa) return null;

  return (
    <div className='container'>
      <Card title='Cadastro de Lançamento'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <FormGroup label='Tipo:' htmlFor='inputTipo'>
                <div>
                  <label>
                    <input
                      type='radio'
                      id='inputTipo'
                      name='tipo'
                      value='Receita'
                      checked={tipo === 'Receita'}
                      onChange={(e) => setTipo(e.target.value)}
                    />
                    Receita
                  </label>
                  <label>
                    <input
                      type='radio'
                      id='inputTipoDespesa'
                      name='tipo'
                      value='Despesa'
                      checked={tipo === 'Despesa'}
                      onChange={(e) => setTipo(e.target.value)}
                    />
                    Despesa
                  </label>
                </div>
              </FormGroup>
              <FormGroup label='Nome: ' htmlFor='inputNome'>
                <input
                  type='text'
                  id='inputNome'
                  value={nome}
                  className='form-control'
                  name='nome'
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormGroup>
              <FormGroup label='Data: ' htmlFor='inputData'>
                <input
                  type='date'
                  id='inputData'
                  value={data}
                  className='form-control'
                  name='data'
                  onChange={(e) => setData(e.target.value)}
                />
              </FormGroup>
              <FormGroup label='Categoria: ' htmlFor='selectCategoria'>
                <select
                  id='selectCategoria'
                  className='form-select'
                  value={idCategoria}
                  onChange={(e) => setIdCategoria(e.target.value)}
                >
                  <option value=''> </option>
                  {(tipo === 'Receita' ? dadosCategoriasReceita : dadosCategoriasDespesa).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </FormGroup>
              <Stack spacing={1} padding={0} direction='row' className='form-switch'>
                <FormGroup label='Volume: &nbsp;' htmlFor='inputVolume'>
                  <input
                    type='checkbox'
                    className='form-check-input'
                    role='switch'
                    id='inputVolume'
                    value={volume}
                    name='volume'
                    onChange={(e) => setVolume(e.target.checked)}
                    checked={volume}
                    style={{ marginLeft: 3 }}
                  /> Fixa
                </FormGroup>
              </Stack>
              <FormGroup label='Valor: ' htmlFor='inputValor'>
                <input
                  type='text'
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
