import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obterIdUsuarioLogado } from '../utils/usuarioLogado';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro } from '../components/toastr';
import '../custom.css';

import api from '../config/axios';
import { filtrarRegistrosDoUsuario } from '../utils/usuarioLogado';

function CadastroAporte() {
    const { idParam } = useParams();

    const navigate = useNavigate();

    const [id, setId] = useState('');
    const [valor, setValor] = useState('');
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [idMetaFinanceira, setIdMetaFinanceira] = useState('');
    const [carregando, setCarregando] = useState(true);

    const [dadosOriginais, setDadosOriginais] = useState(null);
    const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = useState([]);

    const formatarParaInputData = (dataBruta) => {
        if (!dataBruta) return '';

        if (typeof dataBruta === 'string') {
            return dataBruta.split('T')[0];
        }

        if (Array.isArray(dataBruta)) {
            const [ano, mes, dia] = dataBruta;
            const mesFormatado = String(mes).padStart(2, '0');
            const diaFormatado = String(dia).padStart(2, '0');
            return `${ano}-${mesFormatado}-${diaFormatado}`;
        }

        try {
            const d = new Date(dataBruta);
            if (!isNaN(d.getTime())) {
                return d.toISOString().split('T')[0];
            }
        } catch (e) {
            console.error("Erro ao formatar data:", e);
        }

        return '';
    };
    
    function restaurarDados() {
        if (!dadosOriginais) {
            setId('');
            setValor('');
            setData(new Date().toISOString().split('T')[0]);
            setIdMetaFinanceira('');
            return;
        }

        setId(dadosOriginais.id ?? '');
        setValor(dadosOriginais.valor ?? '');
        setData(formatarParaInputData(dadosOriginais.dataEnvio));
        setIdMetaFinanceira(dadosOriginais.idMetaFinanceira ? String(dadosOriginais.idMetaFinanceira) : '');
    }

    async function salvar() {
        if (!valor || Number(valor) <= 0 || !data || !idMetaFinanceira) {
            mensagemErro('Por favor, preencha todos os campos obrigatórios (*)');
            return;
        }

        const idUsuarioLogado = obterIdUsuarioLogado();
        if (!idUsuarioLogado) {
            mensagemErro('Erro: Usuário não identificado. Faça login novamente.');
            return;
        }

        const payload = {
            valor: Number(valor),
            dataEnvio: data.includes('T') ? data : `${data}T00:00:00.000Z`,
            idMetaFinanceira: Number(idMetaFinanceira),
            idCliente: Number(idUsuarioLogado),
            idUsuario: Number(idUsuarioLogado)
        };

        const idValido = idParam && !isNaN(Number(idParam)) && idParam !== 'undefined';
        if (idValido) {
            payload.id = Number(idParam);
        }

        try {
            if (!idValido) {
                await api.post('/aportes', payload);
                mensagemSucesso('Aporte cadastrado com sucesso!');
            } else {
                await api.put(`/aportes/${idParam}`, payload);
                mensagemSucesso('Aporte alterado com sucesso!');
            }

            navigate('/listagem-aportes');
        } catch (error) {
            console.error(error);
            mensagemErro(error?.response?.data?.message || 'Erro ao salvar aporte');
        }
    }

    useEffect(() => {
        async function inicializarComponente() {
            setCarregando(true);
            try {
                const metasResponse = await api.get('/metasFinanceiras');
                setDadosMetasFinanceiras(filtrarRegistrosDoUsuario(metasResponse.data || []));

                const idValido = idParam && !isNaN(Number(idParam)) && idParam !== 'undefined';

                if (idValido) {
                    const aporteResponse = await api.get(`/aportes/${idParam}`);
                    const payload = aporteResponse.data;

                    setDadosOriginais(payload);
                    setId(payload.id ?? '');
                    setValor(payload.valor ?? '');
                    setData(formatarParaInputData(payload.dataEnvio));
                    setIdMetaFinanceira(payload.idMetaFinanceira ? String(payload.idMetaFinanceira) : '');
                }
            } catch (error) {
                console.error('Erro na inicialização da tela de aportes:', error);
                mensagemErro('Erro ao inicializar os dados da tela.');
            } finally {
                setCarregando(false);
            }
        }

        inicializarComponente();
        // eslint-disable-next-line
    }, [idParam]);

    if (carregando) {
        return (
            <div className="container mt-5 text-center">
                <p>Carregando dados do formulário...</p>
            </div>
        );
    }

    return (
        <div className='container'>
            <Card title={idParam && !isNaN(Number(idParam)) ? 'Editar Aporte' : 'Cadastro de Aporte'} icon="bi bi-cash">
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>

                            <FormGroup label='Valor: *' htmlFor='inputValor'>
                                <input
                                    type='number'
                                    id='inputValor'
                                    value={valor}
                                    placeholder="0.00"
                                    step="0.01"
                                    className='form-control'
                                    onChange={(e) => setValor(e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup label='Data: *' htmlFor='inputData'>
                                <input
                                    type='date'
                                    id='inputData'
                                    value={data}
                                    className='form-control'
                                    onChange={(e) => setData(e.target.value)}
                                />
                            </FormGroup>

                            <FormGroup label='Meta Financeira: *' htmlFor='selectMetaFinanceira'>
                                <select
                                    className='form-select'
                                    id='selectMetaFinanceira'
                                    value={idMetaFinanceira}
                                    onChange={(e) => setIdMetaFinanceira(e.target.value)}
                                >
                                    <option value=''>Selecione uma meta...</option>
                                    {dadosMetasFinanceiras.map((meta) => (
                                        <option key={meta.id} value={meta.id}>
                                            {meta.nome}
                                        </option>
                                    ))}
                                </select>
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
                                    onClick={restaurarDados}
                                    type='button'
                                    className='btn btn-warning'
                                >
                                    Restaurar
                                </button>

                                <button
                                    onClick={() => navigate('/listagem-aportes')}
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

export default CadastroAporte;