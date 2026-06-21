import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';
import { obterUsuarioLogado } from '../utils/usuarioLogado';

import '../custom.css';
import api from '../config/axios';

function CadastroLancamento() {
  const { idParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const tipoQuery = new URLSearchParams(location.search).get('tipo');
  
  const idValido = idParam && !isNaN(Number(idParam)) && idParam !== 'undefined';

  const [id, setId] = useState('');
  const [tipo, setTipo] = useState(tipoQuery || 'Receita');
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [volume, setVolume] = useState(false);
  const [valor, setValor] = useState('');
  const [idFormaPagamento, setIdFormaPagamento] = useState('');
  const [parcelada, setParcelada] = useState(false);
  const [quantidadeParcelas, setQuantidadeParcelas] = useState('');

  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [categoriasReceita, setCategoriasReceita] = useState([]);
  const [categoriasDespesa, setCategoriasDespesa] = useState([]);
  const [carregando, setCarregando] = useState(true);

  function restaurarDados() {
    if (!dadosOriginais) {
      setId('');
      setTipo(tipoQuery || 'Receita');
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

  async function salvar() {
    if (!nome || !data || !valor || !idCategoria) {
      mensagemErro('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    if (tipo === 'Despesa' && !idFormaPagamento) {
      mensagemErro('Por favor, selecione uma Forma de Pagamento para a Despesa (*)');
      return;
    }

    if (tipo === 'Despesa' && parcelada && (!quantidadeParcelas || Number(quantidadeParcelas) <= 0)) {
      mensagemErro('Por favor, informe uma quantidade válida de parcelas (*)');
      return;
    }

    const usuarioLogado = obterUsuarioLogado();
    const idUsuarioAtual = usuarioLogado?.id ? Number(usuarioLogado.id) : null;

    if (!idUsuarioAtual) {
      mensagemErro('Erro: Usuário não identificado. Faça login novamente.');
      return;
    }

    const payload = {
      id: idValido ? Number(idParam) : null,
      nome: nome.trim(),
      data,
      volume,
      valor: Number(valor),
      idCliente: idUsuarioAtual,
      idUsuario: idUsuarioAtual
    };

    if (tipo === 'Receita') {
      payload.idCategoriaReceita = Number(idCategoria);
      payload.idFormaPagamento = null;
      payload.parcelada = false;
      payload.quantidadeParcelas = null;
    } else {
      payload.idCategoriaDespesa = Number(idCategoria);
      payload.idFormaPagamento = Number(idFormaPagamento);
      payload.parcelada = parcelada;
      payload.quantidadeParcelas = parcelada ? Number(quantidadeParcelas) : null;
    }

    const endpoint = tipo === 'Receita' ? '/receitas' : '/despesas';

    try {
      if (!idValido) {
        await api.post(endpoint, payload);
        mensagemSucesso('Lançamento cadastrado com sucesso!');
      } else {
        await api.put(`${endpoint}/${idParam}`, payload);
        mensagemSucesso('Lançamento alterado com sucesso!');
      }

      navigate('/listagem-lancamentos');
    } catch (error) {
      console.error(error);
      const mensagemDoServidor = error?.response?.data?.message || error?.response?.data;
      mensagemErro(mensagemDoServidor || 'Erro ao salvar lançamento');
    }
  }

  useEffect(() => {
    async function inicializarComponente() {
      const usuarioLogado = obterUsuarioLogado();
      const idUsuarioAtual = usuarioLogado?.id ? Number(usuarioLogado.id) : null;

      if (!idUsuarioAtual) {
        mensagemErro('Usuário não autenticado.');
        setCarregando(false);
        return;
      }

      try {
        const [fp, cr, cd] = await Promise.all([
          api.get(`/formasPagamento?idCliente=${idUsuarioAtual}`),
          api.get(`/categoriasReceita?idCliente=${idUsuarioAtual}`),
          api.get(`/categoriasDespesa?idCliente=${idUsuarioAtual}`)
        ]);

        setFormasPagamento(fp.data || []);
        setCategoriasReceita(cr.data || []);
        setCategoriasDespesa(cd.data || []);

        if (idValido) {
          const endpoint = tipoQuery === 'Despesa' ? '/despesas' : '/receitas';
          const response = await api.get(`${endpoint}/${idParam}`);
          const dataObtida = response.data;

          const snapshot = {
            ...dataObtida,
            tipo: tipoQuery ?? 'Receita',
            idCategoria: dataObtida.idCategoria ?? dataObtida.idCategoriaReceita ?? dataObtida.idCategoriaDespesa ?? ''
          };

          setDadosOriginais(snapshot);
          setId(snapshot.id ?? '');
          setTipo(snapshot.tipo);
          setNome(snapshot.nome ?? '');
          
          if (snapshot.data && snapshot.data.includes('T')) {
            setData(snapshot.data.split('T')[0]);
          } else {
            setData(snapshot.data ?? '');
          }

          setIdCategoria(snapshot.idCategoria ? String(snapshot.idCategoria) : '');
          setVolume(snapshot.volume ?? false);
          setValor(snapshot.valor ?? '');
          setIdFormaPagamento(snapshot.idFormaPagamento ? String(snapshot.idFormaPagamento) : '');
          setParcelada(snapshot.parcelada ?? false);
          setQuantidadeParcelas(snapshot.quantidadeParcelas ?? '');
        }
      } catch (error) {
        console.error(error);
        mensagemErro('Erro ao inicializar os dados do formulário.');
      } finally {
        setCarregando(false);
      }
    }

    inicializarComponente();
    // eslint-disable-next-line
  }, [idParam, tipoQuery]);

  useEffect(() => {
    if (!idValido) {
      setIdCategoria('');
      if (tipo === 'Receita') {
        setIdFormaPagamento('');
        setParcelada(false);
        setQuantidadeParcelas('');
      }
    }
  }, [tipo, idValido]);

  if (carregando) {
    return (
      <div className="container mt-5 text-center">
        <p>Preparando o formulário...</p>
      </div>
    );
  }

  return (
    <div className='container'>
      <Card title={idValido ? 'Editar Lançamento' : 'Cadastro de Lançamento'} icon='bi bi-wallet2'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>

              <FormGroup label='Tipo:'>&nbsp;
                <label className="me-3">
                  <input
                    type='radio'
                    value='Receita'
                    checked={tipo === 'Receita'}
                    disabled={idValido}
                    onChange={(e) => setTipo(e.target.value)}
                  /> Receita
                </label>
                <label>
                  <input
                    type='radio'
                    value='Despesa'
                    checked={tipo === 'Despesa'}
                    disabled={idValido}
                    onChange={(e) => setTipo(e.target.value)}
                  /> Despesa
                </label>
              </FormGroup>

              <FormGroup label='Nome: *'>
                <input
                  className='form-control'
                  placeholder='Ex: Conta de Luz, Freelance...'
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Data: *'>
                <input
                  type='date'
                  className='form-control'
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Categoria: *'>
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

              <Stack spacing={1} padding={0} direction='row' className='form-switch my-3'>
                <FormGroup label='Volume:' htmlFor='inputVolume'>&nbsp;
                  <input
                    type='checkbox'
                    className='form-check-input'
                    role='switch'
                    id='inputVolume'
                    checked={volume}
                    onChange={(e) => setVolume(e.target.checked)}
                    style={{ marginLeft: 3 }}
                  />
                </FormGroup>
              </Stack>

              <FormGroup label='Valor: *'>
                <input
                  type='number'
                  placeholder='0.00'
                  step='0.01'
                  className='form-control'
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              </FormGroup>

              <FormGroup label={tipo === 'Despesa' ? 'Forma de Pagamento: *' : 'Forma de Pagamento:'}>
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

              <Stack spacing={1} padding={0} direction='row' className='form-switch my-3'>
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

              <FormGroup label={tipo === 'Despesa' && parcelada ? 'Quantidade de Parcelas: *' : 'Quantidade de Parcelas:'} htmlFor='inputQuantidadeParcelas'>
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

              <Stack spacing={1} paddingY={2} direction='row' className="mt-3">
                <button onClick={salvar} className='btn btn-success'>Salvar</button>
                <button onClick={restaurarDados} className='btn btn-warning'>Restaurar</button>
                <button onClick={() => navigate('/listagem-lancamentos')} className='btn btn-danger'>Cancelar</button>
              </Stack>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CadastroLancamento;