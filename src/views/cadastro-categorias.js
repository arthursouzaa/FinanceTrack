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

  const baseURL = `${BASE_URL2}/CategoriaReceita`;

  const [id, setId] = useState('');
  const [tipo, setTipo] = useState('');
  const [nome, setNome] = useState('');

  const [dados, setDados] = React.useState([]);

  function inicializar() {
    if (idParam == null) {
      setId('');
      setTipo('');
      setNome('');
    } else {
      setId(dados.id);
      setTipo(dados.tipo);
      setNome(dados.nome);
    }
  }

  async function salvar() {
    let data = { id, tipo, nome };
    data = JSON.stringify(data);
    if (idParam == null) {
      await axios
        .post(baseURL, data, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(function (response) {
          mensagemSucesso(`Categoria cadastrada com sucesso!`);
          navigate(`/listagem-categorias`);
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
          mensagemSucesso(`Categoria alterada com sucesso!`);
          navigate(`/listagem-categorias`);
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
    }
  }

  return (
    <div className='container'>
      <Card title='Cadastro de Categoria'>
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
                      value='receita'
                      onChange={(e) => setTipo(e.target.value)}
                    />
                    Receita
                  </label>
                  <label>
                    <input
                      type='radio'
                      id='inputTipoDespesa'
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
