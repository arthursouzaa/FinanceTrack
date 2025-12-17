import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';

import '../custom.css';

import axios from 'axios';
import { BASE_URL, BASE_URL2 } from '../config/axios';

const baseReceitas = `${BASE_URL2}/Receita`;
const baseDespesas = `${BASE_URL2}/Despesa`;

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

  async function salvar() {
    const payload = {
      id,
      tipo,
      nome,
      data,
      idCategoria: idCategoria || null,
      volume,
      valor,
      idFormaPagamento: tipo === 'Despesa' ? idFormaPagamento || null : null,
      parcelada: tipo === 'Despesa' ? parcelada : false,
      quantidadeParcelas:
        tipo === 'Despesa' && parcelada ? quantidadeParcelas : null
    };

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
      mensagemErro(error?.response?.data || 'Erro ao salvar lançamento');
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
    } catch {
      mensagemErro('Erro ao buscar lançamento');
    }
  }

  async function carregarListas() {
    try {
      const [fp, cr, cd] = await Promise.all([
        axios.get(`${BASE_URL}/FormaPagamento`),
        axios.get(`${BASE_URL2}/CategoriaReceita`),
        axios.get(`${BASE_URL2}/CategoriaDespesa`)
      ]);

      setFormasPagamento(fp.data);
      setCategoriasReceita(cr.data);
      setCategoriasDespesa(cd.data);
    } catch {
      mensagemErro('Erro ao carregar dados auxiliares');
    }
  }

  useEffect(() => {
    carregarListas();
    buscarLancamento();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
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
