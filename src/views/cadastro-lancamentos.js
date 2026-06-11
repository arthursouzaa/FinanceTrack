import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';
import { obterUsuarioLogado } from '../utils/usuarioLogado';


import '../custom.css';

import axios from 'axios';
import { BASE_URL } from '../config/axios';

const baseReceitas = `${BASE_URL}/receitas`;
const baseDespesas = `${BASE_URL}/despesas`;

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
  const [parcelada, setParcelada] = useState(false);
  const [quantidadeParcelas, setQuantidadeParcelas] = useState('');

  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [formasPagamento, setFormasPagamento] = useState(null);
  const [categoriasReceita, setCategoriasReceita] = useState([]);
  const [categoriasDespesa, setCategoriasDespesa] = useState([]);

  function restaurarDados() {
    if (!dadosOriginais) {
      setId('');
      setTipo('Receita');
      setNome('');
      setData('');
      setIdCategoria('');
      setVolume(false);
      setValor('');
      setIdFormaPagamento('');
      setParcelada(false);
      setQuantidadeParcelas('');
      return;
    }

    setId(dadosOriginais.id ?? '');
    setTipo(dadosOriginais.tipo ?? tipo);
    setNome(dadosOriginais.nome ?? '');
    setData(dadosOriginais.data ?? '');
    setIdCategoria(dadosOriginais.idCategoria ?? '');
    setVolume(dadosOriginais.volume ?? false);
    setValor(dadosOriginais.valor ?? '');
    setIdFormaPagamento(dadosOriginais.idFormaPagamento ?? '');
    setParcelada(dadosOriginais.parcelada ?? false);
    setQuantidadeParcelas(dadosOriginais.quantidadeParcelas ?? '');
  }

  // 1. Certifique-se de que a importação correta está no topo do arquivo:
  // Se o seu utilitário exporta uma função para buscar o objeto ou o ID, use-a. 
  // Geralmente ela se chama obterUsuarioLogado, obterIdUsuarioLogado ou o próprio filtrarRegistrosDoUsuario.

  // ... dentro do componente CadastroLancamento:

  async function salvar() {
    // 2. Utiliza o padrão do seu projeto para buscar o usuário/cliente logado
    const usuarioLogado = obterUsuarioLogado();
    const idUsuarioAtual = usuarioLogado?.id ? Number(usuarioLogado.id) : null;

    if (!idUsuarioAtual) {
      mensagemErro('Erro: Usuário não identificado. Faça login novamente.');
      return;
    }

    // 3. Estrutura base comum com os IDs de vínculo
    const payload = {
      id: id || null,
      nome,
      data,
      volume,
      valor: valor ? Number(valor) : null,
      idCliente: idUsuarioAtual,
      idUsuario: idUsuarioAtual
    };

    // 4. Mapeamento condicional estrito para o Java
    if (tipo === 'Receita') {
      payload.idCategoriaReceita = idCategoria ? Number(idCategoria) : null;
      payload.idFormaPagamento = null;
      payload.parcelada = false;
      payload.quantidadeParcelas = null;
    } else {
      payload.idCategoriaDespesa = idCategoria ? Number(idCategoria) : null;
      payload.idFormaPagamento = idFormaPagamento ? Number(idFormaPagamento) : null;
      payload.parcelada = parcelada;
      payload.quantidadeParcelas = parcelada && quantidadeParcelas ? Number(quantidadeParcelas) : null;
    }

    try {
      if (!idParam) {
        await axios.post(
          tipo === 'Receita' ? baseReceitas : baseDespesas,
          payload
        );
        mensagemSucesso('Lançamento cadastrado com sucesso!');
      } else {
        await axios.put(
          `${tipo === 'Receita' ? baseReceitas : baseDespesas}/${idParam}`,
          payload
        );
        mensagemSucesso('Lançamento alterado com sucesso!');
      }

      navigate('/listagem-lancamentos');
    } catch (error) {
      console.error(error);
      const mensagemDoServidor = error?.response?.data?.message || error?.response?.data;
      mensagemErro(mensagemDoServidor || 'Erro ao salvar lançamento');
    }
  }

  async function buscarLancamento() {
    if (!idParam) return;

    try {
      const endpoint =
        tipoQuery === 'Despesa'
          ? baseDespesas
          : tipoQuery === 'Receita'
            ? baseReceitas
            : null;

      const response = await axios.get(
        endpoint ? `${endpoint}/${idParam}` : `${baseReceitas}/${idParam}`
      );

      const data = response.data;

      const snapshot = {
        ...data,
        tipo: tipoQuery ?? 'Receita',
        idCategoria: data.idCategoria ?? data.idCategoriaReceita ?? data.idCategoriaDespesa ?? ''
      };

      setDadosOriginais(snapshot);

      setId(snapshot.id ?? '');
      setTipo(snapshot.tipo);
      setNome(snapshot.nome ?? '');
      setData(snapshot.data ?? '');
      setIdCategoria(snapshot.idCategoria ? String(snapshot.idCategoria) : '');
      setVolume(snapshot.volume ?? false);
      setValor(snapshot.valor ?? '');
      setIdFormaPagamento(snapshot.idFormaPagamento ?? '');
      setParcelada(snapshot.parcelada ?? false);
      setQuantidadeParcelas(snapshot.quantidadeParcelas ?? '');
    } catch (error) {
      console.error(error);
      mensagemErro('Erro ao buscar lançamento');
    }
  }

  async function carregarListas() {
    try {
      const [fp, cr, cd] = await Promise.all([
        axios.get(`${BASE_URL}/formasPagamento`),
        axios.get(`${BASE_URL}/categoriasReceita`),
        axios.get(`${BASE_URL}/categoriasDespesa`)
      ]);

      setFormasPagamento(fp.data);
      setCategoriasReceita(cr.data);
      setCategoriasDespesa(cd.data);
    } catch (error) {
      console.error(error);
      mensagemErro('Erro ao carregar dados auxiliares');
    }
  }

  useEffect(() => {
    carregarListas();
    buscarLancamento();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Evita o vazamento de IDs de categorias inválidos ao trocar o tipo de fluxo
    setIdCategoria('');

    if (tipo === 'Receita') {
      setIdFormaPagamento('');
      setParcelada(false);
      setQuantidadeParcelas('');
    }
  }, [tipo]);

  if (!formasPagamento) return null;

  return (
    <div className='container'>
      <Card title='Cadastro de Lançamento' icon='bi bi-wallet2'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>

              <FormGroup label='Tipo:'>&nbsp;
                <label>
                  <input
                    type='radio'
                    value='Receita'
                    checked={tipo === 'Receita'}
                    onChange={(e) => setTipo(e.target.value)}
                  /> Receita
                </label>
                &nbsp;&nbsp;
                <label>
                  <input
                    type='radio'
                    value='Despesa'
                    checked={tipo === 'Despesa'}
                    onChange={(e) => setTipo(e.target.value)}
                  /> Despesa
                </label>
              </FormGroup>

              <FormGroup label='Nome:'>
                <input
                  className='form-control'
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Data:'>
                <input
                  type='date'
                  className='form-control'
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Categoria:'>
                <select
                  className='form-select'
                  value={idCategoria}
                  onChange={(e) => setIdCategoria(e.target.value)}
                >
                  <option value=''></option>
                  {(tipo === 'Receita' ? categoriasReceita : categoriasDespesa)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
              </FormGroup>

              <Stack spacing={1} padding={0} direction='row' className='form-switch'>
                <FormGroup label='Volume:' htmlFor='inputVolume'>&nbsp;
                  <input
                    type='checkbox'
                    className='form-check-input'
                    role='switch'
                    id='inputVolume'
                    checked={volume}
                    onChange={(e) => {
                      setVolume(e.target.checked);
                    }}
                    style={{ marginLeft: 3 }}
                  />
                </FormGroup>
              </Stack>

              <FormGroup label='Valor:'>
                <input
                  type='number'
                  className='form-control'
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Forma de Pagamento:'>
                <select
                  className='form-select'
                  value={idFormaPagamento}
                  onChange={(e) => setIdFormaPagamento(e.target.value)}
                  disabled={tipo === 'Receita'}
                >
                  <option value=''></option>
                  {formasPagamento.map(fp => (
                    <option key={fp.id} value={fp.id}>{fp.nome}</option>
                  ))}
                </select>
              </FormGroup>

              <Stack spacing={1} padding={0} direction='row' className='form-switch'>
                <FormGroup label='Parcelada:' htmlFor='inputParcelada'>&nbsp;
                  <input
                    type='checkbox'
                    className='form-check-input'
                    role='switch'
                    id='inputParcelada'
                    checked={parcelada}
                    disabled={tipo === 'Receita'}
                    onChange={(e) => {
                      setParcelada(e.target.checked);
                      if (!e.target.checked) {
                        setQuantidadeParcelas('');
                      }
                    }}
                    style={{ marginLeft: 3 }}
                  />
                </FormGroup>
              </Stack>

              <FormGroup label='Quantidade de Parcelas:' htmlFor='inputQuantidadeParcelas'>
                <input
                  type='number'
                  min='1'
                  id='inputQuantidadeParcelas'
                  className='form-control'
                  value={quantidadeParcelas}
                  disabled={tipo === 'Receita' || !parcelada}
                  onChange={(e) => setQuantidadeParcelas(e.target.value)}
                />
              </FormGroup>

              <Stack spacing={1} padding={1} direction='row'>
                <button onClick={salvar} className='btn btn-success'>Salvar</button>
                <button onClick={restaurarDados} className='btn btn-warning'>Restaurar</button>
                <button onClick={() => navigate(-1)} className='btn btn-danger'>Cancelar</button>
              </Stack>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CadastroLancamento;