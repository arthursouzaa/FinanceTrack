import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obterIdUsuarioLogado } from '../utils/usuarioLogado';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';
import '../custom.css';
import api from '../config/axios';

function CadastroMeta() {
  const { idParam } = useParams(); 
  const navigate = useNavigate();

  function obterMesAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
  }

  const formatarParaInputMes = (dataIso) => {
    if (!dataIso) return '';
    return dataIso.substring(0, 7);
  };

  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [dataEnvio, setDataEnvio] = useState(obterMesAtual());
  const [dataAlvo, setDataAlvo] = useState('');
  const [investimentoInicial, setInvestimentoInicial] = useState('');
  const [carregando, setCarregando] = useState(false);

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
    if (!nome || nome.trim() === '' || !valor || Number(valor) <= 0 || !dataEnvio || !dataAlvo) {
      mensagemErro('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    if (dataAlvo < dataEnvio) {
      mensagemErro('A data alvo não pode ser anterior à data inicial da meta.');
      return;
    }

    if (investimentoInicial && Number(investimentoInicial) < 0) {
      mensagemErro('O investimento inicial não pode ser negativo.');
      return;
    }

    const idUsuarioLogado = obterIdUsuarioLogado();

    if (!idUsuarioLogado) {
      mensagemErro('Não foi possível identificar o usuário logado. Faça login novamente.');
      return;
    }

    const formatarParaIso = (anoMes) => {
      if (!anoMes) return null;
      if (anoMes.includes('T')) return anoMes; 
      return `${anoMes}-01T00:00:00.000Z`;
    };

    const payload = {
      nome,
      valor: formatarParaNumero(valor),
      dataEnvio: formatarParaIso(dataEnvio),
      dataAlvo: formatarParaIso(dataAlvo),
      investimentoInicial: formatarParaNumero(investimentoInicial),
      status: true,
      idCliente: Number(idUsuarioLogado)
    };

    if (idParam && idParam !== 'undefined') {
      payload.id = Number(idParam);
    }

    try {
      if (!idParam || idParam === 'undefined') {
        await api.post('/metasFinanceiras', payload);
        mensagemSucesso(`Meta "${nome}" cadastrada com sucesso!`);
      } else {
        await api.put(`/metasFinanceiras/${idParam}`, payload);
        mensagemSucesso(`Meta "${nome}" alterada com sucesso!`);
      }

      navigate('/listagem-metas');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data || 'Erro ao salvar meta';
      mensagemErro(msg);
    }
  }

  useEffect(() => {
    async function buscarMeta() {
      if (!idParam || idParam === 'undefined') return;

      setCarregando(true);
      try {
        const response = await api.get(`/metasFinanceiras/${idParam}`);
        const data = response.data;

        setDadosOriginais(data);

        setId(data.id ?? '');
        setNome(data.nome ?? '');
        setDataEnvio(formatarParaInputMes(data.dataEnvio));
        setValor(data.valor ?? '');
        setDataAlvo(formatarParaInputMes(data.dataAlvo));
        setInvestimentoInicial(data.investimentoInicial ?? '');
      } catch (error) {
        console.error(error);
        mensagemErro('Erro ao buscar dados da meta para edição.');
      } finally {
        setCarregando(false);
      }
    }

    buscarMeta();
  }, [idParam]);

  if (carregando) {
    return (
      <div className="container mt-5 text-center">
        <p>Carregando informações da meta...</p>
      </div>
    );
  }

  return (
    <div className='container mb-5'>
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