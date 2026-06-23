import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obterIdUsuarioLogado } from '../utils/usuarioLogado';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';
import '../custom.css';
import api from '../config/axios';

function CadastroFormaPagamento() {
  const { idParam } = useParams();
  const navigate = useNavigate();

  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [carregando, setCarregando] = useState(false);
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
    if (!nome || nome.trim() === '') {
        mensagemErro('Por favor, preencha o campo obrigatório: Nome (*)');
        return;
    }

    if (nome.trim().length < 3) {
        mensagemErro('O nome da forma de pagamento deve ter pelo menos 3 caracteres.');
        return;
    }

    const idUsuarioLogado = obterIdUsuarioLogado();

    if (!idUsuarioLogado) {
      mensagemErro('Não foi possível identificar o usuário logado. Faça login novamente.');
      return;
    }

    const payload = {
      id: id || null,
      nome,
      idCliente: Number(idUsuarioLogado),
      idUsuario: Number(idUsuarioLogado)
    };

    try {
      if (!idParam) {
        await api.post('/formasPagamento', payload);
        mensagemSucesso(`Forma de pagamento "${nome}" cadastrada com sucesso!`);
      } else {
        await api.put(`/formasPagamento/${idParam}`, payload);
        mensagemSucesso(`Forma de pagamento "${nome}" alterada com sucesso!`);
      }

      navigate('/listagem-formasPagamento');
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || error?.response?.data || 'Erro ao salvar forma de pagamento';
      mensagemErro(msg);
    }
  }

  useEffect(() => {
    async function buscarFormaPagamento() {
      if (!idParam) return;

      setCarregando(true);
      try {
        const response = await api.get(`/formasPagamento/${idParam}`);
        const data = response.data;

        setDadosOriginais(data);
        setId(data.id ?? '');
        setNome(data.nome ?? '');
      } catch (error) {
        console.error(error);
        mensagemErro('Erro ao buscar forma de pagamento');
      } finally {
        setCarregando(false);
      }
    }

    buscarFormaPagamento();
  }, [idParam]);

  if (carregando) {
    return (
      <div className="container mt-5 text-center">
        <p>Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className='container'>
      <Card title={idParam ? 'Editar Forma de Pagamento' : 'Cadastro de Forma de Pagamento'} icon="bi bi-credit-card-2-back">
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <FormGroup label='Nome: *' htmlFor='inputNome'>
                <input
                  type='text'
                  id='inputNome'
                  value={nome}
                  className='form-control'
                  placeholder='Ex: Cartão de Crédito, Pix, Boleto...'
                  name='nome'
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormGroup>
              <Stack spacing={1} padding={1} direction='row' className="mt-3">
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
                  onClick={() => navigate('/listagem-formasPagamento')}
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