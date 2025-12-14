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

  const [dadosOriginais, setDadosOriginais] = useState(null);

  function inicializar() {
    if (!idParam) {
      setId('');
      setTipo('Receita');
      setNome('');
      setLimiteGasto(false);
      setValorLimite('');
      return;
    }

    if (dadosOriginais) {
      setId(dadosOriginais.id ?? '');
      setTipo(dadosOriginais.tipo ?? '');
      setNome(dadosOriginais.nome ?? '');
      setLimiteGasto(dadosOriginais.limiteGasto ?? false);
      setValorLimite(dadosOriginais.valorLimite ?? '');
    }
  }

  async function salvar() {
    const data = {
      id,
      tipo,
      nome,
      limiteGasto,
      valorLimite: limiteGasto ? valorLimite : null
    };

    try {
      if (!idParam) {
        tipo === 'Receita'
          ? await axios.post(baseReceitas, data)
          : await axios.post(baseDespesas, data);
        mensagemSucesso('Categoria cadastrada com sucesso!');
      } else {
        tipo === 'Receita'
          ? await axios.put(`${baseReceitas}/${idParam}`, data)
          : await axios.put(`${baseDespesas}/${idParam}`, data);
        mensagemSucesso('Categoria alterada com sucesso!');
      }
      navigate('/listagem-categorias');
    } catch (error) {
      mensagemErro(error?.response?.data || 'Erro ao salvar categoria');
    }
  }

  async function buscar() {
    if (!idParam) return;

    try {
      let data;

      if (tipoQuery === 'Despesa') {
        const resp = await axios.get(`${baseDespesas}/${idParam}`);
        data = { ...resp.data, tipo: 'Despesa' };
      } else {
        const resp = await axios.get(`${baseReceitas}/${idParam}`);
        data = { ...resp.data, tipo: 'Receita' };
      }

      setDadosOriginais(data);
      setId(data.id ?? '');
      setTipo(data.tipo);
      setNome(data.nome ?? '');
      setLimiteGasto(data.limiteGasto ?? false);
      setValorLimite(data.valorLimite ?? '');
    } catch {
      mensagemErro('Erro ao buscar categoria');
    }
  }

  useEffect(() => {
    buscar();
    // eslint-disable-next-line
  }, [idParam, tipoQuery]);

  useEffect(() => {
    if (tipo === 'Receita') {
      setLimiteGasto(false);
      setValorLimite('');
    }
  }, [tipo]);

  return (
    <div className='container'>
      <Card title='Cadastro de Categoria'>
        <div className='bs-component'>
          <Stack spacing={1} direction='row'>
            <FormGroup label='Tipo:' display='inline'>
              <label>
                <input
                  type='radio'
                  name='tipo'
                  value='Receita'
                  checked={tipo === 'Receita'}
                  onChange={(e) => {
                    setTipo(e.target.value);
                    setLimiteGasto(false);
                    setValorLimite('');
                  }}
                />
                Receita
              </label>
              &nbsp;&nbsp;
              <label>
                <input
                  type='radio'
                  name='tipo'
                  value='Despesa'
                  checked={tipo === 'Despesa'}
                  onChange={(e) => setTipo(e.target.value)}
                />
                Despesa
              </label>
            </FormGroup>
          </Stack>

          <FormGroup label='Nome:'>
            <input
              className='form-control'
              value={nome}
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
                name='limiteGasto'
                checked={limiteGasto}
                disabled={tipo === 'Receita'}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setLimiteGasto(checked);
                  if (!checked) {
                    setValorLimite('');
                  }
                }}
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
              disabled={tipo !== 'Despesa' || !limiteGasto}
              onChange={(e) => setValorLimite(e.target.value)}
            />
          </FormGroup>

          <Stack spacing={1} padding={1} direction='row'>
            <button className='btn btn-success' onClick={salvar}>Salvar</button>
            <button className='btn btn-warning' onClick={inicializar}>Restaurar</button>
            <button className='btn btn-danger' onClick={() => navigate(-1)}>Cancelar</button>
          </Stack>
        </div>
      </Card>
    </div>
  );
}

export default CadastroCategoria;
