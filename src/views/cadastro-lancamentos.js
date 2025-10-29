import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL, BASE_URL2 } from '../config/axios';

function getDataAtual() {
        // Create a new Date object for today
        const today = new Date();

        // Format the date to YYYY-MM-DD, which is required for input type="date"
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;

        // Set the value of the input field
        return formattedDate;
}

function CadastroLancamento() {
  const { idParam } = useParams();
  const navigate = useNavigate();

  const baseLocal = BASE_URL2; // Receita, Despesa, Categoria* (jsonfake2)
  const baseRemote = BASE_URL; // FormaPagamento, MetaFinanceira, etc. (jsonfake)

  const DEFAULT_CLIENTE_ID = 1;

  const [tipo, setTipo] = useState('receita'); // 'receita' | 'despesa'
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [data, setData] = useState(getDataAtual());
  const [idCategoriaReceita, setIdCategoriaReceita] = useState('');
  const [idCategoriaDespesa, setIdCategoriaDespesa] = useState('');
  const [volume, setVolume] = useState(false);
  const [valor, setValor] = useState('');
  const [idFormaPagamento, setIdFormaPagamento] = useState('');
  const [parcelada, setParcelada] = useState(false);
  const [quantidadeParcelas, setQuantidadeParcelas] = useState('');
  
  const [dadosCategoriasReceita, setDadosCategoriasReceita] = useState([]);
  const [dadosCategoriasDespesa, setDadosCategoriasDespesa] = useState([]);
  const [dadosFormasPagamento, setDadosFormasPagamento] = useState([]);
  const [loading, setLoading] = useState(true);

  // load selects (categories + formas)
  useEffect(() => {
    let mounted = true;
    async function carregarListas() {
      try {
        const [catRecRes, catDespRes, formasRes] = await Promise.all([
          axios.get(`${baseLocal}/CategoriaReceita`).catch(() => ({ data: [] })),
          axios.get(`${baseLocal}/CategoriaDespesa`).catch(() => ({ data: [] })),
          axios.get(`${baseRemote}/FormaPagamento`).catch(() => ({ data: [] })),
        ]);

        if (!mounted) return;

        setDadosCategoriasReceita(catRecRes.data || []);
        setDadosCategoriasDespesa(catDespRes.data || []);
        setDadosFormasPagamento(formasRes.data || []);
      } catch (err) {
        console.error(err);
        mensagemErro('Erro ao carregar listas');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    carregarListas();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load existing lançamento when editing
  useEffect(() => {
    if (!idParam) {
      inicializar();
      return;
    }

    let mounted = true;
    async function buscar() {
      try {
        setLoading(true);
        // try Receita first
        const receitaRes = await axios.get(`${baseLocal}/Receita/${idParam}`).catch(() => ({ status: 404 }));
        if (receitaRes && receitaRes.status !== 404 && receitaRes.data) {
          const r = receitaRes.data;
          if (!mounted) return;
          setTipo('receita');
          setId(r.id ?? '');
          setNome(r.nome ?? '');
          setData(r.data ?? getDataAtual());
          setVolume(Boolean(r.volume));
          setValor(r.valor ?? '');
          setIdCategoriaReceita(r.idCategoriaReceita ?? '');
          // clear despesa fields
          setIdCategoriaDespesa('');
          setIdFormaPagamento('');
          setParcelada(false);
          setQuantidadeParcelas('');
          return;
        }

        // try Despesa
        const despesaRes = await axios.get(`${baseLocal}/Despesa/${idParam}`).catch(() => ({ status: 404 }));
        if (despesaRes && despesaRes.status !== 404 && despesaRes.data) {
          const d = despesaRes.data;
          if (!mounted) return;
          setTipo('despesa');
          setId(d.id ?? '');
          setNome(d.nome ?? '');
          setData(d.data ?? getDataAtual());
          setVolume(Boolean(d.volume));
          setValor(d.valor ?? '');
          setIdCategoriaDespesa(d.idCategoriaDespesa ?? '');
          setIdFormaPagamento(d.idFormaPagamento ?? '');
          setParcelada(Boolean(d.parcelada));
          setQuantidadeParcelas(d.quantidadeParcelas ?? '');
          return;
        }

        mensagemErro('Lançamento não encontrado para edição.');
      } catch (err) {
        console.error(err);
        mensagemErro('Erro ao buscar lançamento.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    buscar();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam]);

  function inicializar() {
    setTipo('receita');
    setId('');
    setNome('');
    setData('');
    setVolume(false);
    setValor('');
    setIdCategoriaReceita('');
    setIdCategoriaDespesa('');
    setIdFormaPagamento('');
    setParcelada(false);
    setQuantidadeParcelas('');
  }

  async function salvar() {
    try {
      if (!nome || nome.trim() === '') {
        mensagemErro('Nome é obrigatório');
        return;
      }

      if (tipo === 'receita') {
        const payload = {
          nome: nome.trim(),
          data: data || null,
          volume: Boolean(volume),
          valor: valor === '' ? null : Number(valor),
          idCategoriaReceita: idCategoriaReceita === '' ? null : Number(idCategoriaReceita),
          idCliente: DEFAULT_CLIENTE_ID,
        };

        if (!idParam) {
          await axios.post(`${baseLocal}/Receita`, payload, { headers: { 'Content-Type': 'application/json' } });
          mensagemSucesso('Lançamento cadastrado com sucesso!');
        } else {
          await axios.put(`${baseLocal}/Receita/${idParam}`, payload, { headers: { 'Content-Type': 'application/json' } });
          mensagemSucesso('Lançamento alterado com sucesso!');
        }
      } else {
        const payload = {
          nome: nome.trim(),
          data: data || null,
          volume: Boolean(volume),
          valor: valor === '' ? null : Number(valor),
          idCategoriaDespesa: idCategoriaDespesa === '' ? null : Number(idCategoriaDespesa),
          idFormaPagamento: idFormaPagamento === '' ? null : Number(idFormaPagamento),
          parcelada: Boolean(parcelada),
          quantidadeParcelas: quantidadeParcelas === '' ? null : Number(quantidadeParcelas),
          idCliente: DEFAULT_CLIENTE_ID,
          };

        if (!idParam) {
          await axios.post(`${baseLocal}/Despesa`, payload, { headers: { 'Content-Type': 'application/json' } });
          mensagemSucesso('Lançamento cadastrado com sucesso!');
        } else {
          await axios.put(`${baseLocal}/Despesa/${idParam}`, payload, { headers: { 'Content-Type': 'application/json' } });
          mensagemSucesso('Lançamento alterado com sucesso!');
        }
      }

      navigate('/listagem-lancamentos');
    } catch (err) {
      console.error(err);
      mensagemErro(err?.response?.data || 'Erro ao salvar lançamento');
    }
  }

  if (loading) {
    return (
      <div className='container'>
        <Card title='Cadastro de Lançamento'>
          <div>Carregando...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className='container'>
      <Card title='Cadastro de Lançamento'>
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

              <FormGroup label='Data:' htmlFor='inputData'>
                <input
                  type='date'
                  id='inputData'
                  value={data}
                  defaultValue={getDataAtual()}
                  placeholder={getDataAtual()}
                  className='form-control'
                  onChange={(e) => setData(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Volume:&nbsp;' htmlFor='inputVolume'>
                <input
                  type='checkbox'
                  id='inputVolume'
                  checked={volume}
                  onChange={(e) => setVolume(e.target.checked)}
                /> Fixa
              </FormGroup>

              <FormGroup label='Valor:' htmlFor='inputValor'>
                <input
                  type='number'
                  id='inputValor'
                  value={valor}
                  className='form-control'
                  onChange={(e) => setValor(e.target.value)}
                  step='0.01'
                  min='0'
                />
              </FormGroup>

              {tipo === 'receita' && (
                <FormGroup label='Categoria:' htmlFor='selectCategoriaReceita'>
                  <select
                    className='form-select'
                    id='selectCategoriaReceita'
                    name='idCategoriaReceita'
                    value={idCategoriaReceita}
                    onChange={(e) => setIdCategoriaReceita(e.target.value)}
                  >
                    <option value=''> </option>
                    {dadosCategoriasReceita.map((dado) => (
                      <option key={dado.id} value={dado.id}>
                        {dado.nome}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              )}

              {tipo === 'despesa' && (
                <>
                  <FormGroup label='Categoria:' htmlFor='selectCategoriaDespesa'>
                    <select
                      className='form-select'
                      id='selectCategoriaDespesa'
                      name='idCategoriaDespesa'
                      value={idCategoriaDespesa}
                      onChange={(e) => setIdCategoriaDespesa(e.target.value)}
                    >
                      <option value=''> </option>
                      {dadosCategoriasDespesa.map((dado) => (
                        <option key={dado.id} value={dado.id}>
                          {dado.nome}
                        </option>
                      ))}
                    </select>
                  </FormGroup>

                  <FormGroup label='Forma de pagamento:' htmlFor='idFormaPagamento'>
                    <select
                      className='form-select'
                      id='idFormaPagamento'
                      name='idFormaPagamento'
                      value={idFormaPagamento}
                      onChange={(e) => setIdFormaPagamento(e.target.value)}
                    >
                      <option value=''> </option>
                      {dadosFormasPagamento.map((dado) => (
                        <option key={dado.id} value={dado.id}>
                          {dado.nome}
                        </option>
                      ))}
                    </select>
                  </FormGroup>

                  <FormGroup label='Parcelada:&nbsp;' htmlFor='inputParcelada'>
                    <input
                      type='checkbox'
                      id='inputParcelada'
                      checked={parcelada}
                      onChange={(e) => setParcelada(e.target.checked)}
                    />
                  </FormGroup>

                  {parcelada && (
                    <FormGroup label='Quantidade de Parcelas:' htmlFor='inputQuantidadeParcelas'>
                      <input
                        type='number'
                        id='inputQuantidadeParcelas'
                        value={quantidadeParcelas}
                        className='form-control'
                        onChange={(e) => setQuantidadeParcelas(e.target.value)}
                        step='1'
                        min='1'
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

export default CadastroLancamento;