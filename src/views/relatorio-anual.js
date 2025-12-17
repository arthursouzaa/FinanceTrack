import React, { useState, useEffect } from 'react';

import Card from '../components/card';
import Stack from '@mui/material/Stack';
import FormGroup from '../components/form-group';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

import '../custom.css';

import axios from 'axios';
import { BASE_URL, BASE_URL2 } from '../config/axios';
import { borderRadius } from '@mui/system';

const baseReceitas = `${BASE_URL2}/Receita`;
const baseDespesas = `${BASE_URL2}/Despesa`;
const baseAportes = `${BASE_URL}/Aporte`;
const baseCategoriasR = `${BASE_URL2}/CategoriaReceita`;
const baseCategoriasD = `${BASE_URL2}/CategoriaDespesa`;
const baseMetas = `${BASE_URL}/MetaFinanceira`;
const baseFormasPagamento = `${BASE_URL}/FormaPagamento`;

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, annotationPlugin);

function RelatorioAnual() {
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [aportes, setAportes] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [dadosCategoriasReceita, setDadosCategoriasReceita] = useState([]);
  const [dadosCategoriasDespesa, setDadosCategoriasDespesa] = useState([]);
  const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = useState([]);
  const [filtroAno, setFiltroAno] = React.useState('Todos');

  React.useEffect(() => {
    axios.get(baseReceitas).then((response) => {
      setReceitas(response.data);
    });
    axios.get(baseDespesas).then((response) => {
      setDespesas(response.data);
    });
    axios.get(baseAportes).then((response) => {
      setAportes(response.data);
    });
    axios.get(baseFormasPagamento).then((response) => {
      setFormasPagamento(response.data);
    });
    axios.get(baseCategoriasR).then((response) => {
      setDadosCategoriasReceita(response.data);
    });
    axios.get(baseCategoriasD).then((response) => {
      setDadosCategoriasDespesa(response.data);
    });
    axios.get(baseMetas).then((response) => {
      setDadosMetasFinanceiras(response.data);
    });
  }, []);

  if (!receitas || !dadosCategoriasReceita) return null;
  if (!despesas || !dadosCategoriasDespesa) return null;
  if (!aportes || !dadosMetasFinanceiras) return null;

  const paletaCores = [
    '#98e6ff',
    '#50bbfa',
    '#6089ec',
    '#9329ed',
    '#761cc2',
    '#760690'
  ]

  // filtros:

  function obterDadosFiltrados(dados) {
    return dados.filter((dado) => {
      if (!dado.data) return true;

      const ano = extrairAno(dado.data);

      const filtraAno =
        filtroAno === 'Todos' || ano === Number(filtroAno);

      return filtraAno;
    });
  }

  function extrairAno(data) {
    return new Date(data).getFullYear();
  }

  function obterAnosDisponiveis() {
    const todasDatas = [
      ...receitas,
      ...despesas,
      ...aportes
    ]
      .filter(l => l.data)
      .map(l => new Date(l.data).getFullYear());

    const anosUnicos = [...new Set(todasDatas)];

    return anosUnicos.sort((a, b) => b - a);
  }

  function somarValores(lista) {
    return lista.reduce((acc, item) => {
      const valor = Number(item.valor) || 0;
      return acc + valor;
    }, 0);
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function formatarAno(ano) {
    if (ano == "Todos") {
      return "__";
    } else {
      return ano;
    }
  }


  // gráficos:

  const receitasFiltradas = obterDadosFiltrados(receitas);
  const despesasFiltradas = obterDadosFiltrados(despesas);
  const aportesFiltrados = obterDadosFiltrados(aportes);

  const totalReceitas = somarValores(receitasFiltradas);
  const totalDespesas = somarValores(despesasFiltradas);

  const labelsReceitas = dadosCategoriasReceita.map((c) => c.nome);

  const valoresPorCategoriasReceita = dadosCategoriasReceita.map((categoria) => {
    const totalCategoria = (receitasFiltradas || [])
      .filter((receita) => String(receita.idCategoriaReceita) === String(categoria.id))
      .reduce((soma, receita) => soma + Number(receita.valor || 0), 0);
    return totalCategoria;
  });

  const dadosGraficoPizzaCategoriasR = {
    labels: labelsReceitas,
    datasets: [{
      label: 'Categorias de Receitas',
      data: valoresPorCategoriasReceita,
      backgroundColor: paletaCores,
      borderWidth: [0, 0],
    }]
  };

  const labelsDespesas = dadosCategoriasDespesa.map((c) => c.nome);

  const valoresPorCategoriasDespesa = dadosCategoriasDespesa.map((categoria) => {
    const totalCategoria = (despesasFiltradas || [])
      .filter((receita) => String(receita.idCategoriaDespesa) === String(categoria.id))
      .reduce((soma, receita) => soma + Number(receita.valor || 0), 0);
    return totalCategoria;
  });

  const dadosGraficoPizzaCategoriasD = {
    labels: labelsDespesas,
    datasets: [{
      label: 'Categorias de Despesas',
      data: valoresPorCategoriasDespesa,
      backgroundColor: paletaCores,
      borderWidth: [0, 0],
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
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: { display: false },
    }
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
    datasets: [{
      label: ['Receitas'],
      data: receitasPorMes,
      fill: true,
      borderColor: '#50bbfa',
      backgroundColor: '#50bbfa',
      tension: 0.1
    }, {
      label: ['Despesas'],
      data: despesasPorMes,
      fill: true,
      borderColor: '#9329ed',
      backgroundColor: '#9329ed',
      tension: 0.1
    }
    ],
  }

  const opcoesGraficoLinha = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } },
    }
  }

  const dadosGraficoLinhaFaturas = {
    labels: meses,
    datasets: formasPagamento.map((forma, index) => {
      const dataPorMes = meses.map((_, mesIndex) => {
        const mes = mesIndex + 1;
        return despesasFiltradas
          .filter((d) => d.parcelada === true && String(d.idFormaPagamento) === String(forma.id) && d.data && new Date(d.data).getMonth() + 1 === mes)
          .reduce((sum, d) => sum + Number(d.valor || 0), 0);
      });
      const total = dataPorMes.reduce((sum, v) => sum + v, 0);
      if (total > 0) {
        return {
          label: forma.nome,
          data: dataPorMes,
          borderColor: paletaCores[index % paletaCores.length],
          backgroundColor: paletaCores[index % paletaCores.length],
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
            content: ({ chart }) => [
              `${Math.floor(Number(chart.data.datasets[0].data[0]))}%`,
            ],
            font: { size: 30 },
            color: 'black'
          }
        }
      },
      legend: { display: true, position: 'bottom', labels: { boxWidth: 15, boxHeight: 15 } },
      tooltip: {
        callbacks: {
          label: function (context) {
            return Math.round(context.parsed) + '%';
          }
        }
      }

    }
  }

  return (
    <div className='container'>
      <Card title='Relatório Anual' icon='bi bi-bank'>
        <p className='text-muted'>Total de seus dados financeiros no ano de {formatarAno(filtroAno)}</p>
        <strong style={{ color: '#9329ed' }}>Selecione o ano:</strong>
        <Stack spacing={2} direction="row" alignItems="center" marginTop={2}>
          <label><strong>Ano:</strong></label>
          <select
            className="form-select"
            style={{ width: 120 }}
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {obterAnosDisponiveis().map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </Stack>
        <br></br>
        <Stack spacing={2} direction="row" sx={{ mb: 2 }}>
          <div className="resumo-card receita">
            <span className="resumo-titulo">Receitas</span>
            <span className="resumo-valor positivo">
              {totalReceitas > 0 ? formatarMoeda(totalReceitas) : '—'} ▲
            </span>
          </div>

          <div className="resumo-card despesa">
            <span className="resumo-titulo">Despesas</span>
            <span className="resumo-valor negativo">
              {totalDespesas > 0 ? formatarMoeda(totalDespesas) : '—'} ▲
            </span>
          </div>
        </Stack>

        <br></br>

        <Stack spacing={1} direction="row">
          <Card title='Receitas'>
            <Pie data={dadosGraficoPizzaCategoriasR} options={opcoesGraficoPizza} />
          </Card>
          <Card title='Despesas'>
            <Pie data={dadosGraficoPizzaCategoriasD} options={opcoesGraficoPizza} />
          </Card>
        </Stack>
        <br></br>
        <Stack spacing={1} direction="row" >
          <Card title='Comparativo'>
            <Line data={dadosGraficoLinhaComparativo} options={opcoesGraficoLinha} />
          </Card>
        </Stack>
        <br></br>
        <Stack spacing={1} direction="row" >
          <Card title='Volume das Despesas'>
            <Bar data={dadosGraficoBarrasVolume} options={opcoesGraficoBarraHorizontal} />
          </Card>
        </Stack>
        <br></br>
        <Stack spacing={1} direction="row" >
          <Card title='Metas Financeiras'>
            <Stack spacing={1} direction="row" >
              {dadosMetasFinanceiras.map((meta, index) => {

                const anoMeta = meta.dataEnvio
                  ? new Date(meta.dataEnvio).getFullYear()
                  : null;

                const metaAtivaNoAno =
                  filtroAno === 'Todos' || anoMeta === Number(filtroAno);

                const investimentoInicial = Number(meta.investimentoInicial) || 0;

                const totalAportes = aportesFiltrados
                  .filter((a) => String(a.idMetaFinanceira) === String(meta.id))
                  .reduce((sum, a) => sum + Number(a.valor || 0), 0);

                const totalInvestido = metaAtivaNoAno
                  ? investimentoInicial + totalAportes
                  : 0;

                const progresso = metaAtivaNoAno
                  ? Math.min((totalInvestido / Number(meta.valor)) * 100, 100)
                  : 0;

                const falta = 100 - progresso;

                const dados = {
                  labels: ['Aportado', 'Falta'],
                  datasets: [{
                    data: [progresso, falta],
                    backgroundColor: [paletaCores[1], paletaCores[3]],
                    borderWidth: [0, 0],
                    circumference: 150,
                    rotation: 285,
                    cutout: 120,
                    borderRadius: {
                      outerStart: [100, 0],
                      innerStart: [100, 0],
                      outerEnd: [0, 100],
                      innerEnd: [0, 100]
                    },
                  }]
                };

                return (
                  <Card key={meta.id} title={meta.nome}>
                    <Doughnut data={dados} options={opcoesGraficoDonut} />
                  </Card>
                );
              })}
            </Stack>
          </Card>
        </Stack>
        <br></br>
        <Stack spacing={1} direction="row" >
          <Card title='Faturas Mensais'>
            <Line data={dadosGraficoLinhaFaturas} options={opcoesGraficoLinha} />
          </Card>
        </Stack>
      </Card>
    </div>
  );
}

export default RelatorioAnual;