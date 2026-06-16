import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import api from '../config/axios';
import { obterUsuarioLogado } from '../utils/usuarioLogado';

function CadastroCategoria() {
  const { idParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const tipoQuery = new URLSearchParams(location.search).get('tipo');

  const [id, setId] = useState('');
  const [tipo, setTipo] = useState(tipoQuery || 'Receita');
  const [nome, setNome] = useState('');
  const [limiteGasto, setLimiteGasto] = useState(false);
  const [valorLimite, setValorLimite] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [dadosOriginais, setDadosOriginais] = useState(null);

  function inicializar() {
    if (!idParam) {
      setId('');
      setTipo(tipoQuery || 'Receita');
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
    if (!nome || nome.trim() === '') {
      mensagemErro('Por favor, preencha o campo obrigatório: Nome (*)');
      return;
    }

    if (nome.trim().length < 3) {
      mensagemErro('O nome da categoria deve ter pelo menos 3 caracteres.');
      return;
    }

    if (tipo === 'Despesa' && limiteGasto && (!valorLimite || Number(valorLimite) <= 0)) {
      mensagemErro('Por favor, preencha um valor limite maior que zero (*)');
      return;
    }

    const usuarioLogado = obterUsuarioLogado();
    const idUsuarioAtual = usuarioLogado?.id ? Number(usuarioLogado.id) : null;

    if (!idUsuarioAtual) {
      mensagemErro('Erro: Usuário não identificado. Faça login novamente.');
      return;
    }

    const data = {
      id: idParam && !isNaN(Number(idParam)) ? Number(idParam) : null, 
      tipo,
      nome: nome.trim(),
      limiteGasto: tipo === 'Despesa' ? limiteGasto : false,
      valorLimite: tipo === 'Despesa' && limiteGasto && valorLimite ? Number(valorLimite) : null,
      idCliente: idUsuarioAtual,  
      idUsuario: idUsuarioAtual   
    };

    const endpoint = tipo === 'Receita' ? '/categoriasReceita' : '/categoriasDespesa';
    const idValido = idParam && !isNaN(Number(idParam)) && idParam !== 'undefined';

    try {
      if (!idValido) {
        await api.post(endpoint, data);
        mensagemSucesso('Categoria cadastrada com sucesso!');
      } else {
        await api.put(`${endpoint}/${idParam}`, data);
        mensagemSucesso('Categoria alterada com sucesso!');
      }
      navigate('/listagem-categorias');
    } catch (error) {
      console.error(error);
      const mensagemDoServidor = error?.response?.data?.message || error?.response?.data;
      mensagemErro(mensagemDoServidor || 'Erro ao salvar categoria');
    }
  }

  useEffect(() => {
    async function buscar() {
      const idValido = idParam && !isNaN(Number(idParam)) && idParam !== 'undefined';
      if (!idValido) return;

      setCarregando(true);
      try {
        let dataObtida;

        if (tipoQuery === 'Despesa') {
          const resp = await api.get(`/categoriasDespesa/${idParam}`);
          dataObtida = { ...resp.data, tipo: 'Despesa' };
        } else {
          const resp = await api.get(`/categoriasReceita/${idParam}`);
          dataObtida = { ...resp.data, tipo: 'Receita' };
        }

        setDadosOriginais(dataObtida);
        setId(dataObtida.id ?? '');
        setTipo(dataObtida.tipo); 
        setNome(dataObtida.nome ?? '');
        setLimiteGasto(dataObtida.limiteGasto ?? false);
        setValorLimite(dataObtida.valorLimite ?? '');
      } catch (error) {
        console.error(error);
        mensagemErro('Erro ao buscar categoria');
      } finally {
        setCarregando(false);
      }
    }

    buscar();
    // eslint-disable-next-line
  }, [idParam, tipoQuery]);

  if (carregando) {
    return (
      <div className="container mt-5 text-center">
        <p>Carregando dados do formulário...</p>
      </div>
    );
  }

  return (
    <div className='container'>
      <Card title={idParam && !isNaN(Number(idParam)) ? 'Editar Categoria' : 'Cadastro de Categoria'} icon='bi bi-tags'>
        <div className='bs-component'>
          <Stack spacing={1} direction='row' className="mb-3">
            <FormGroup label='Tipo:&nbsp;' display='inline'>
              <label className="me-3">
                <input
                  type='radio'
                  name='tipo'
                  value='Receita'
                  checked={tipo === 'Receita'}
                  disabled={!!idParam}
                  onChange={(e) => {
                    setTipo(e.target.value);
                    setLimiteGasto(false);
                    setValorLimite('');
                  }}
                />
                &nbsp;Receita
              </label>
              <label>
                <input
                  type='radio'
                  name='tipo'
                  value='Despesa'
                  checked={tipo === 'Despesa'}
                  disabled={!!idParam} 
                  onChange={(e) => setTipo(e.target.value)}
                />
                &nbsp;Despesa
              </label>
            </FormGroup>
          </Stack>

          <FormGroup label='Nome: *'>
            <input
              className='form-control'
              value={nome}
              placeholder="Ex: Alimentação, Salário..."
              onChange={(e) => setNome(e.target.value)}
            />
          </FormGroup>

          <Stack spacing={1} padding={0} direction='row' className='form-switch my-3'>
            <FormGroup label='Definir Limite de Gasto:&nbsp;' htmlFor='inputLimiteGasto'>
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

          <FormGroup label={limiteGasto ? 'Valor Limite: *' : 'Valor Limite:'} htmlFor='inputValorLimite'>
            <input
              type='number'  
              id='inputValorLimite'
              value={valorLimite}
              placeholder="0.00"
              step="0.01"
              className='form-control'
              name='valorLimite'
              disabled={tipo !== 'Despesa' || !limiteGasto}
              onChange={(e) => setValorLimite(e.target.value)}
            />
          </FormGroup>

          <Stack spacing={1} paddingY={2} direction='row' className="mt-3">
            <button className='btn btn-success' onClick={salvar}>Salvar</button>
            <button className='btn btn-warning' onClick={inicializar}>Restaurar</button>
            <button className='btn btn-danger' onClick={() => navigate('/listagem-categorias')}>Cancelar</button>
          </Stack>
        </div>
      </Card>
    </div>
  );
}

export default CadastroCategoria;