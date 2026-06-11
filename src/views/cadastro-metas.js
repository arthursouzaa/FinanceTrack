import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obterIdUsuarioLogado } from '../utils/usuarioLogado';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';
import '../custom.css';

import axios from 'axios';
import { BASE_URL } from '../config/axios';

function CadastroMeta() {
  // Captura o ID da URL de forma segura
  const idParam = window.location.pathname.split('/').pop() !== 'cadastro-metas'
    ? window.location.pathname.split('/').pop()
    : undefined; 
  
  const navigate = useNavigate();
  const baseURL = `${BASE_URL}/metasFinanceiras`;

  function obterMesAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
  }

  // Helper para cortar a string ISO "2026-06-01T00:00:00.000Z" para o padrão do input "2026-06"
  const formatarParaInputMes = (dataIso) => {
    if (!dataIso) return '';
    return dataIso.substring(0, 7); // Pega apenas os 7 primeiros caracteres (YYYY-MM)
  };

  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [dataEnvio, setDataEnvio] = useState(obterMesAtual());
  const [dataAlvo, setDataAlvo] = useState('');
  const [investimentoInicial, setInvestimentoInicial] = useState('');

  const [dadosOriginais, setDadosOriginais] = useState(null);

  function restaurarDados() {
    if (!dadosOriginais) {
      setId('');
      setNome('');
      setDataEnvio(obterMesAtual());
      setValor('');
      setDataAlvo('');
      setInvestimentoInicial('');
      return;
    }

    setId(dadosOriginais.id ?? '');
    setNome(dadosOriginais.nome ?? '');
    setDataEnvio(formatarParaInputMes(dadosOriginais.dataEnvio));
    setValor(dadosOriginais.valor ?? '');
    setDataAlvo(formatarParaInputMes(dadosOriginais.dataAlvo));
    setInvestimentoInicial(dadosOriginais.investimentoInicial ?? '');
  }

  const formatarParaNumero = (val) => {
    if (!val) return 0;
    const stringLimpa = String(val).replace(',', '.');
    return isNaN(Number(stringLimpa)) ? 0 : Number(stringLimpa);
  };

  async function salvar() {
    if (!nome || !valor || !dataEnvio || !dataAlvo) {
      mensagemErro('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    const idUsuarioLogado = obterIdUsuarioLogado();

    if (!idUsuarioLogado) {
      mensagemErro('Não foi possível identificar o usuário logado. Faça login novamente.');
      return;
    }

    const formatarParaIso = (anoMes) => {
      if (!anoMes) return null;
      // Se a data já vier completa (no caso de reenvio sem alteração), mantém
      if (anoMes.includes('T')) return anoMes; 
      return `${anoMes}-01T00:00:00.000Z`;
    };

    // Monta o payload inicial
    const payload = {
      nome,
      valor: formatarParaNumero(valor),
      dataEnvio: formatarParaIso(dataEnvio),
      dataAlvo: formatarParaIso(dataAlvo),
      investimentoInicial: formatarParaNumero(investimentoInicial),
      status: true,
      idCliente: Number(idUsuarioLogado)
    };

    // SE FOR EDIÇÃO: injeta o ID mapeado da meta no JSON enviado
    if (idParam) {
      payload.id = Number(idParam);
    }

    try {
      if (!idParam) {
        await axios.post(baseURL, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        mensagemSucesso(`Meta "${nome}" cadastrada com sucesso!`);
      } else {
        await axios.put(`${baseURL}/${idParam}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        mensagemSucesso(`Meta "${nome}" alterada com sucesso!`);
      }

      navigate('/listagem-metas');
    } catch (error) {
      mensagemErro(error?.response?.data || 'Erro ao salvar meta');
    }
  }

  async function buscar() {
    if (!idParam || idParam === 'undefined') return;

    try {
      const response = await axios.get(`${baseURL}/${idParam}`);
      const data = response.data;

      setDadosOriginais(data);

      setId(data.id ?? '');
      setNome(data.nome ?? '');
      // Aplica a formatação curta para os inputs de mês carregarem visualmente
      setDataEnvio(formatarParaInputMes(data.dataEnvio));
      setValor(data.valor ?? '');
      setDataAlvo(formatarParaInputMes(data.dataAlvo));
      setInvestimentoInicial(data.investimentoInicial ?? '');
    } catch (error) {
      mensagemErro(error?.response?.data || 'Erro ao buscar meta');
    }
  }

  useEffect(() => {
    buscar();
  }, [idParam]);

  return (
    <div className='container'>
      <Card title={idParam ? 'Editar Meta' : 'Cadastro de Meta'} icon="bi bi-cash-coin">
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <FormGroup label='Nome: *' htmlFor='inputNome'>
                <input
                  type='text'
                  id='inputNome'
                  value={nome}
                  className='form-control'
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Data-Envio: *' htmlFor='inputDataEnvio'>
                <input
                  type='month'
                  id='inputDataEnvio'
                  value={dataEnvio}
                  className='form-control'
                  onChange={(e) => setDataEnvio(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Valor-Alvo: *' htmlFor='inputValor'>
                <input
                  type='text'
                  id='inputValor'
                  value={valor}
                  placeholder="0.00"
                  className='form-control'
                  onChange={(e) => setValor(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Data-Alvo: *' htmlFor='inputDataAlvo'>
                <input
                  type='month'
                  id='inputDataAlvo'
                  value={dataAlvo}
                  className='form-control'
                  onChange={(e) => setDataAlvo(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Investimento inicial:' htmlFor='inputInvestimentoInicial'>
                <input
                  type='text'
                  id='inputInvestimentoInicial'
                  value={investimentoInicial}
                  placeholder="0.00"
                  className='form-control'
                  onChange={(e) => setInvestimentoInicial(e.target.value)}
                />
              </FormGroup>

              <Stack spacing={1} padding={1} direction='row' className="mt-3">
                <button onClick={salvar} type='button' className='btn btn-success'>
                  Salvar
                </button>
                <button onClick={restaurarDados} type='button' className='btn btn-warning'>
                  Restaurar
                </button>
                <button
                  onClick={() => navigate('/listagem-metas')}
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

export default CadastroMeta;