import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL2 } from '../config/axios';

function CadastroCategoria() {
  const { idParam } = useParams();
  const navigate = useNavigate();

  const baseURL = BASE_URL2; // use single baseURL and append collection

  const [tipo, setTipo] = useState('receita'); // 'receita' | 'despesa'
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [limiteGasto, setLimiteGasto] = useState(false);
  const [valorLimite, setValorLimite] = useState('');

  useEffect(() => {
    if (!idParam) {
      inicializar();
      return;
    }
    // try fetch from receita first, if not found fetch despesa
    async function buscar() {
      try {
        const receita = await axios.get(`${baseURL}/CategoriaReceita/${idParam}`);
        if (receita?.data) {
          setTipo('receita');
          setId(receita.data.id ?? '');
          setNome(receita.data.nome ?? '');
          setLimiteGasto(false);
          setValorLimite('');
          return;
        }
      } catch (e) {
        // ignore, try despesa
      }
      try {
        const despesa = await axios.get(`${baseURL}/CategoriaDespesa/${idParam}`);
        if (despesa?.data) {
          setTipo('despesa');
          setId(despesa.data.id ?? '');
          setNome(despesa.data.nome ?? '');
          setLimiteGasto(Boolean(despesa.data.limiteGasto));
          setValorLimite(despesa.data.valorLimite ?? '');
        }
      } catch (error) {
        mensagemErro('Erro ao buscar categoria.');
      }
    }
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam]);

  function inicializar() {
    setId('');
    setNome('');
    setTipo('receita');
    setLimiteGasto(false);
    setValorLimite('');
  }

  async function salvar() {
    try {
      if (tipo === 'receita') {
        const payload = { nome };
        if (!idParam) {
          await axios.post(`${baseURL}/CategoriaReceita`, payload, { headers: { 'Content-Type': 'application/json' } });
          mensagemSucesso('Categoria de receita cadastrada com sucesso!');
        } else {
          await axios.put(`${baseURL}/CategoriaReceita/${idParam}`, payload, { headers: { 'Content-Type': 'application/json' } });
          mensagemSucesso('Categoria de receita alterada com sucesso!');
        }
      } else {
        const payload = { nome, limiteGasto: Boolean(limiteGasto), valorLimite: valorLimite === '' ? null : Number(valorLimite) };
        if (!idParam) {
          await axios.post(`${baseURL}/CategoriaDespesa`, payload, { headers: { 'Content-Type': 'application/json' } });
          mensagemSucesso('Categoria de despesa cadastrada com sucesso!');
        } else {
          await axios.put(`${baseURL}/CategoriaDespesa/${idParam}`, payload, { headers: { 'Content-Type': 'application/json' } });
          mensagemSucesso('Categoria de despesa alterada com sucesso!');
        }
      }
      navigate('/listagem-categorias');
    } catch (error) {
      mensagemErro(error?.response?.data || 'Erro ao salvar categoria');
    }
  }

  return (
    <div className='container'>
      <Card title='Cadastro de Categoria'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <FormGroup label='Tipo:' htmlFor='tipoReceita'>
                <div>
                  <label style={{ marginRight: 12 }}>
                    <input
                      type='radio'
                      id='tipoReceita'
                      name='tipo'
                      value='receita'
                      checked={tipo === 'receita'}
                      onChange={() => setTipo('receita')}
                    />{' '}
                    Receita
                  </label>
                  <label>
                    <input
                      type='radio'
                      id='tipoDespesa'
                      name='tipo'
                      value='despesa'
                      checked={tipo === 'despesa'}
                      onChange={() => setTipo('despesa')}
                    />{' '}
                    Despesa
                  </label>
                </div>
              </FormGroup>

              <FormGroup label='Nome:' htmlFor='inputNome'>
                <input
                  type='text'
                  id='inputNome'
                  value={nome}
                  className='form-control'
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormGroup>

              {tipo === 'despesa' && (
                <>
                  <FormGroup label='Limite de Gasto:' htmlFor='inputLimiteGasto'>
                    <input
                      type='checkbox'
                      id='inputLimiteGasto'
                      checked={limiteGasto}
                      onChange={(e) => setLimiteGasto(e.target.checked)}
                    />
                  </FormGroup>

                  {limiteGasto && (
                    <FormGroup label='Valor Limite:' htmlFor='inputValorLimite'>
                      <input
                        type='number'
                        id='inputValorLimite'
                        value={valorLimite}
                        className='form-control'
                        onChange={(e) => setValorLimite(e.target.value)}
                        step='0.01'
                        min='0'
                      />
                    </FormGroup>
                  )}
                </>
              )}

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

export default CadastroCategoria;