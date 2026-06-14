import React, { useState, useEffect } from 'react';
import Card from '../components/card';
import Stack from '@mui/material/Stack';
import { mensagemErro } from '../components/toastr';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

import '../custom.css';

import api from '../config/axios';
import { filtrarRegistrosDoUsuario } from '../utils/usuarioLogado';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, annotationPlugin);

function RelatorioAnual() {
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [aportes, setAportes] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [dadosCategoriasReceita, setDadosCategoriasReceita] = useState([]);
  const [dadosCategoriasDespesa, setDadosCategoriasDespesa] = useState([]);
  const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = useState([]);
  const [filtroAno, setFiltroAno] = useState('Todos');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDadosRelatorio() {
      try {
        const [
          receitasRes,
          despesasRes,
          aportesRes,
          formasPagamentoRes,
          categoriasRRes,
          categoriasDRes,
          metasRes
        ] = await Promise.all([
          api.get('/receitas'),
          api.get('/despesas'),
          api.get('/aportes'),
          api.get('/formasPagamento'),
          api.get('/categoriasReceita'),
          api.get('/categoriasDespesa'),
          api.get('/metasFinanceiras')
        ]);

        setReceitas(filtrarRegistrosDoUsuario(receitasRes.data));
        setDespesas(filtrarRegistrosDoUsuario(despesasRes.data));
        setAportes(filtrarRegistrosDoUsuario(aportesRes.data));
        setFormasPagamento(filtrarRegistrosDoUsuario(formasPagamentoRes.data));
        setDadosCategoriasReceita(filtrarRegistrosDoUsuario(categoriasRRes.data));
        setDadosCategoriasDespesa(filtrarRegistrosDoUsuario(categoriasDRes.data));
        setDadosMetasFinanceiras(filtrarRegistrosDoUsuario(metasRes.data));
      } catch (error) {
        console.error('Erro ao buscar dados do relatório:', error);
        mensagemErro('Erro ao carregar os dados e gráficos do relatório.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosRelatorio();
  }, []);

  if (carregando) {
    return (
      <div className="container text-center mt-5">
        <p>Carregando dados e gerando gráficos analíticos...</p>
      </div>
    );
  }

  const paletaCores = [
    '#98e6ff',
    '#50bbfa',
    '#6089ec',
    '#9329ed',
    '#761cc2',
    '#760690'
  ];

  function obterDadosFiltrados(dados) {
    return dados.filter((dado) => {
      if (!dado.data) return true;
      const ano = new Date(dado.data).getFullYear();
      return filtroAno === 'Todos' || ano === Number(filtroAno);
    });
  }

  function obterAnosDisponiveis() {
    const todasDatas = [...receitas, ...despesas, ...aportes]
      .filter((l) => l.data)
      .map((l) => new Date(l.data).getFullYear());

    return [...new Set(todasDatas)].sort((a, b) => b - a);
  }

  function somarValores(lista) {
    return lista.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const receitasFiltradas = obterDadosFiltrados(receitas);
  const despesasFiltradas = obterDadosFiltrados(despesas);
  const aportesFiltrados = obterDadosFiltrados(aportes);

  const totalReceitas = somarValores(receitasFiltradas);
  const totalDespesas = somarValores(despesasFiltradas);

  const labelsReceitas = dadosCategoriasReceita.map((c) => c.nome);
  const valoresPorCategoriasReceita = dadosCategoriasReceita.map((categoria) => {
    return receitasFiltradas
      .filter((receita) => String(receita.idCategoriaReceita) === String(categoria.id))
      .reduce((soma, receita) => soma + Number(receita.valor || 0), 0);
  });

  const dadosGraficoPizzaCategoriasR = {
    labels: labelsReceitas,
    datasets: [{
      label: 'Categorias de Receitas',
      data: valoresPorCategoriasReceita,
      backgroundColor: paletaCores,
      borderWidth: 0,
    }]
  };

  const labelsDespesas = dadosCategoriasDespesa.map((c) => c.nome);
  const valoresPorCategoriasDespesa = dadosCategoriasDespesa.map((categoria) => {
    return despesasFiltradas
      .filter((despesa) => String(despesa.idCategoriaDespesa) === String(categoria.id))
      .reduce((soma, despesa) => soma + Number(despesa.valor || 0), 0);
  });

  const dadosGraficoPizzaCategoriasD = {
    labels: labelsDespesas,
    datasets: [{
      label: 'Categorias de Despesas',
      data: valoresPorCategoriasDespesa,
      backgroundColor: paletaCores,
      borderWidth: 0,
    }],
  };

  const opcoesGraficoPizza = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right', labels: { boxWidth: 15, boxHeight: 15 } },
    }
  };

  const fixas = despesasFiltradas.filter((d) => d.volume).length;
  const naoFixas = despesasFiltradas.filter((d) => !d.volume).length;
  
  const dadosGraficoBarrasVolume = {
    labels: ['Fixas', 'Não Fixas'],
    datasets: [{
      label: 'Volume das Despesas',
      data: [fixas, naoFixas],
      backgroundColor: [paletaCores[1], paletaCores[2]],
    }]
  };

  const opcoesGraficoBarraHorizontal = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: { x: { beginAtZero: true } },
    plugins: { legend: { display: false } }
  };

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const receitasPorMes = meses.map((_, index) => {
    const mes = index + 1;
    return receitasFiltradas
      .filter((r) => r.data && new Date(r.data).getMonth() + 1 === mes)
      .reduce((sum, r) => sum + Number(r.valor || 0), 0);
  });

  const despesasPorMes = meses.map((_, index) => {
    const mes = index + 1;
    return despesasFiltradas
      .filter((d) => d.data && new Date(d.data).getMonth() + 1 === mes)
      .reduce((sum, d) => sum + Number(d.valor || 0), 0);
  });

  const dadosGraficoLinhaComparativo = {
    labels: meses,
    datasets: [
      {
        label: 'Receitas',
        data: receitasPorMes,
        fill: true,
        borderColor: '#50bbfa',
        backgroundColor: 'rgba(80, 187, 250, 0.2)',
        tension: 0.1
      },
      {
        label: 'Despesas',
        data: despesasPorMes,
        fill: true,
        borderColor: '#9329ed',
        backgroundColor: 'rgba(147, 41, 237, 0.2)',
        tension: 0.1
      }
    ],
  };

  const opcoesGraficoLinha = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } },
    }
  };

  const dadosGraficoLinhaFaturas = {
    labels: meses,
    datasets: formasPagamento.map((forma, index) => {
      const dataPorMes = meses.map((_, mesIndex) => {
        const mes = mesIndex + 1;
        return despesasFiltradas
          .filter((d) => d.parcelada === true && String(d.idFormaPagamento) === String(forma.id) && d.data && new Date(d.data).getMonth() + 1 === mes)
          .reduce((sum, d) => sum + Number(d.valor || 0), 0);
      });
      
      if (dataPorMes.reduce((sum, v) => sum + v, 0) > 0) {
        return {
          label: forma.nome,
          data: dataPorMes,
          borderColor: paletaCores[index % paletaCores.length],
          backgroundColor: 'transparent',
          tension: 0.1
        };
      }
      return null;
    }).filter(dataset => dataset !== null)
  };

  const opcoesGraficoDonut = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      annotation: {
        annotations: {
          doughnutLabel: {
            type: 'doughnutLabel',
            content: ({ chart }) => [`${Math.floor(Number(chart.data.datasets[0].data[0]))}%`],
            font: { size: 24, weight: 'bold' },
            color: 'black'
          }
        }
      },
      legend: { display: true, position: 'bottom', labels: { boxWidth: 15, boxHeight: 15 } },
      tooltip: {
        callbacks: {
          label: (context) => `Progresso: ${Math.round(context.parsed)}%`
        }
      }
    }
  };

  return (
    <div className='container'>
      <Card title='Relatório Anual' icon='bi bi-bank'>
        <p className='text-muted'>Total de seus dados financeiros no ano de {filtroAno === 'Todos' ? 'todos os períodos' : filtroAno}</p>
        <strong style={{ color: '#9329ed' }}>Selecione o ano base:</strong>
        
        <Stack spacing={2} direction="row" alignItems="center" marginTop={2} marginBottom={3}>
          <label><strong>Ano:</strong></label>
          <select
            className="form-select"
            style={{ width: 140 }}
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {obterAnosDisponiveis().map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </Stack>

        <Stack spacing={2} direction="row" sx={{ mb: 4 }}>
          <div className="resumo-card receita p-3 border rounded" style={{ flex: 1 }}>
            <span className="resumo-titulo d-block text-muted">Receitas</span>
            <span className="resumo-valor positivo fs-4 fw-bold text-success">
              {totalReceitas > 0 ? formatarMoeda(totalReceitas) : '—'} ▲
            </span>
          </div>

          <div className="resumo-card despesa p-3 border rounded" style={{ flex: 1 }}>
            <span className="resumo-titulo d-block text-muted">Despesas</span>
            <span className="resumo-valor negativo fs-4 fw-bold text-danger">
              {totalDespesas > 0 ? formatarMoeda(totalDespesas) : '—'} ▼
            </span>
          </div>
        </Stack>

        <div className="row mb-4">
          <div className="col-md-6">
            <Card title='Distribuição de Receitas'>
              <div style={{ height: '280px' }}>
                <Pie data={dadosGraficoPizzaCategoriasR} options={opcoesGraficoPizza} />
              </div>
            </Card>
          </div>
          <div className="col-md-6">
            <Card title='Distribuição de Despesas'>
              <div style={{ height: '280px' }}>
                <Pie data={dadosGraficoPizzaCategoriasD} options={opcoesGraficoPizza} />
              </div>
            </Card>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-12">
            <Card title='Comparativo Mensal (Entradas vs Saídas)'>
              <div style={{ height: '320px' }}>
                <Line data={dadosGraficoLinhaComparativo} options={opcoesGraficoLinha} />
              </div>
            </Card>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-12">
            <Card title='Volume de Despesas (Fixas vs Variáveis)'>
              <div style={{ height: '200px' }}>
                <Bar data={dadosGraficoBarrasVolume} options={opcoesGraficoBarraHorizontal} />
              </div>
            </Card>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-12">
            <Card title='Metas Financeiras Ativas'>
              <div className="row row-cols-1 row-cols-md-3 g-3">
                {dadosMetasFinanceiras.map((meta) => {
                  const anoMeta = meta.dataEnvio ? new Date(meta.dataEnvio).getFullYear() : null;
                  const metaAtivaNoAno = filtroAno === 'Todos' || anoMeta === Number(filtroAno);

                  const investimentoInicial = Number(meta.investimentoInicial) || 0;
                  const totalAportes = aportesFiltrados
                    .filter((a) => String(a.idMetaFinanceira) === String(meta.id))
                    .reduce((sum, a) => sum + Number(a.valor || 0), 0);

                  const totalInvestido = metaAtivaNoAno ? investimentoInicial + totalAportes : 0;
                  const progresso = metaAtivaNoAno && Number(meta.valor) > 0
                    ? Math.min((totalInvestido / Number(meta.valor)) * 100, 100)
                    : 0;

                  const falta = 100 - progresso;

                  const dadosMeta = {
                    labels: ['Aportado', 'Falta'],
                    datasets: [{
                      data: [progresso, falta],
                      backgroundColor: [paletaCores[1], '#e0e0e0'],
                      borderWidth: 0,
                      cutout: '75%'
                    }]
                  };

                  return (
                    <div className="col" key={meta.id}>
                      <div className="card h-100 p-2 shadow-sm text-center">
                        <h6 className="card-title mt-1 fw-bold">{meta.nome}</h6>
                        <div style={{ maxWidth: '160px', margin: '0 auto' }}>
                          <Doughnut data={dadosMeta} options={opcoesGraficoDonut} />
                        </div>
                        <small className="text-muted d-block mt-2">
                          Alvo: {formatarMoeda(Number(meta.valor || 0))}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Card title='Previsão de Faturas Mensais (Crédito/Parcelados)'>
              <div style={{ height: '320px' }}>
                <Line data={dadosGraficoLinhaFaturas} options={opcoesGraficoLinha} />
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RelatorioAnual;