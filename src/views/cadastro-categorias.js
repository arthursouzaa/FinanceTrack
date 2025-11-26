import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL2 } from '../config/axios';

const baseReceitas = `${BASE_URL2}/CategoriaReceita`;
const baseDespesas = `${BASE_URL2}/CategoriaDespesa`;

function CadastroCategoria() {
  const { idParam } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const tipoQuery = new URLSearchParams(location.search).get('tipo');

  const [id, setId] = useState('');
  const [tipo, setTipo] = useState('Receita');
  const [nome, setNome] = useState('');
  const [limiteGasto, setLimiteGasto] = useState(false);
  const [valorLimite, setValorLimite] = useState('');

  function inicializar() {
    setId('');
    setTipo('Receita');
    setNome('');
    setLimiteGasto(false);
    setValorLimite('');
  }

  async function salvar() {
    let data = { id, tipo, nome, limiteGasto, valorLimite };
    try {
      if (!idParam) {
        if (tipo === 'Receita') {
          await axios.post(baseReceitas, data, { headers: { 'Content-Type': 'application/json' } });
        } else {
          await axios.post(baseDespesas, data, { headers: { 'Content-Type': 'application/json' } });
        }
        mensagemSucesso('Categoria cadastrada com sucesso!');
      } else {
        if (tipo === 'Receita') {
          await axios.put(`${baseReceitas}/${idParam}`, data, { headers: { 'Content-Type': 'application/json' } });
        } else {
          await axios.put(`${baseDespesas}/${idParam}`, data, { headers: { 'Content-Type': 'application/json' } });
        }
        mensagemSucesso('Categoria alterada com sucesso!');
      }
      navigate('/listagem-categorias');
    } catch (error) {
      mensagemErro(error?.response?.data || 'Erro ao salvar categoria');
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
          setLimiteGasto(data.limiteGasto ?? false);
          setValorLimite(data.valorLimite ?? '');
          return;
        }
        if (tipoQuery === 'Receita') {
          const resp = await axios.get(`${baseReceitas}/${idParam}`);
          const data = resp.data;
          setId(data.id ?? idParam);
          setTipo('Receita');
          setNome(data.nome ?? '');
          setLimiteGasto(false);
          setValorLimite('');
          return;
        }

        try {
          const response = await axios.get(`${baseReceitas}/${idParam}`);
          const data = response.data;
          setId(data.id ?? idParam);
          setTipo('Receita');
          setNome(data.nome ?? '');
          setLimiteGasto(false);
          setValorLimite('');
        } catch (errReceita) {
          try {
            const response = await axios.get(`${baseDespesas}/${idParam}`);
            const data = response.data;
            setId(data.id ?? idParam);
            setTipo('Despesa');
            setNome(data.nome ?? '');
            setLimiteGasto(data.limiteGasto ?? false);
            setValorLimite(data.valorLimite ?? '');
          } catch (errDespesa) {
            mensagemErro('Categoria não encontrada');
          }
        }
      } catch (err) {
        mensagemErro('Erro ao buscar categoria');
      }
    }
  }

  useEffect(() => {
    buscar();
    // eslint-disable-next-line
  }, [idParam, tipoQuery]);

  return (
    <div className='container'>
      <Card title='Cadastro de Categoria'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <Stack spacing={1} padding={0} direction='row'>
                <FormGroup label='Tipo: &nbsp;' htmlFor='inputTipo' display='inline'>
                  <label>
                    <input
                      type='radio'
                      id='inputTipo'
                      name='tipo'
                      value='Receita'
                      checked={tipo === 'Receita'}
                      onChange={(e) => setTipo(e.target.value)}
                    />
                    Receita &nbsp;
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
                    Despesa &nbsp;
                  </label>
                </FormGroup>
              </Stack>
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
              <Stack spacing={1} padding={0} direction='row' className='form-switch'>
                <FormGroup label='Limite de Gasto: &nbsp;' htmlFor='inputLimiteGasto'>
                  <input
                    type='checkbox'
                    className='form-check-input'
                    role='switch'
                    id='inputLimiteGasto'
                    value={limiteGasto}
                    name='limiteGasto'
                    onChange={(e) => setLimiteGasto(e.target.checked)}
                    disabled={tipo === 'Receita'}
                    checked={limiteGasto}
                    style={{ marginLeft: 3 }}
                  />
                </FormGroup>
              </Stack>
              <FormGroup label='Valor Limite: ' htmlFor='inputValorLimite'>
                <input
                  type='text'
                  id='inputValorLimite'
                  value={valorLimite}
                  className='form-control'
                  name='valorLimite'
                  disabled={tipo === 'Receita' && !limiteGasto}
                  onChange={(e) => setValorLimite(e.target.value)}
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

export default CadastroCategoria;
