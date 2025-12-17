import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL } from '../config/axios';

function CadastroFormaPagamento() {
  const { idParam } = useParams();

  const navigate = useNavigate();

  const baseURL = `${BASE_URL}/FormaPagamento`;

  const [id, setId] = useState('');
  const [nome, setNome] = useState('');

  const [dadosOriginais, setDadosOriginais] = useState(null);

  function inicializar() {
    if (!idParam) {
      setId('');
      setNome('');
      return;
    }

    if (dadosOriginais) {
      setId(dadosOriginais.id ?? '');
      setNome(dadosOriginais.nome ?? '');
    }
  }

  async function salvar() {
    let data = { id, nome };
    data = JSON.stringify(data);
    if (idParam == null) {
      await axios
        .post(baseURL, data, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(function (response) {
          mensagemSucesso(`Forma de pagamento ${nome} cadastrada com sucesso!`);
          navigate(`/listagem-formasPagamento`);
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
          mensagemSucesso(`Forma de pagamento ${nome} alterada com sucesso!`);
          navigate(`/listagem-formasPagamento`);
        })
        .catch(function (error) {
          mensagemErro(error.response.data);
        });
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
    } catch (error) {
      mensagemErro(error?.response?.data || 'Erro ao buscar forma de pagamento');
    }
  }

  useEffect(() => {
    buscar();
  }, [idParam]);

  return (
    <div className='container'>
      <Card title='Cadastro de Forma de Pagamento' icon="bi bi-credit-card-2-back">
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
                  className='btn btn-warning'
                >
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

export default CadastroFormaPagamento;
