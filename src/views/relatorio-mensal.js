import React, { useState, useEffect } from 'react';

import Card from '../components/card';
import Stack from '@mui/material/Stack';
import FormGroup from '../components/form-group';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

import '../custom.css';

import axios from 'axios';
import { BASE_URL, BASE_URL2 } from '../config/axios';
import { border, height } from '@mui/system';

const baseReceitas = `${BASE_URL2}/Receita`;
const baseDespesas = `${BASE_URL2}/Despesa`;
const baseAportes = `${BASE_URL}/Aporte`;
const baseCategoriasR = `${BASE_URL2}/CategoriaReceita`;
const baseCategoriasD = `${BASE_URL2}/CategoriaDespesa`;
const baseMetas = `${BASE_URL}/MetaFinanceira`;

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function RelatorioMensal() {
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [aportes, setAportes] = useState([]);
  const [dadosCategoriasReceita, setDadosCategoriasReceita] = useState([]);
  const [dadosCategoriasDespesa, setDadosCategoriasDespesa] = useState([]);
  const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = useState([]);
  const [filtroMes, setFiltroMes] = React.useState('Todos');
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

      const mes = extrairMes(dado.data);
      const ano = extrairAno(dado.data);

      const filtraMes =
        filtroMes === 'Todos' || mes === Number(filtroMes);

      const filtraAno =
        filtroAno === 'Todos' || ano === Number(filtroAno);

      return filtraMes && filtraAno;
    });
  }

  function extrairMes(data) {
    return new Date(data).getMonth() + 1; // 1 a 12
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

  function formatarMes(mes) {
    switch (mes) {
      case "1":
        return "Janeiro";
        break;
      case "2":
        return "Fevereiro";
        break;
      case "3":
        return "Março";
        break;
      case "4":
        return "Abril";
        break;
      case "5":
        return "Maio";
        break;
      case "6":
        return "Junho";
        break;
      case "7":
        return "Julho";
        break;
      case "8":
        return "Agosto";
        break;
      case "9":
        return "Setembro";
        break;
      case "10":
        return "Outubro";
        break;
      case "11":    
        return "Novembro";
        break;
      case "12":
        return "Dezembro";
        break;
      default: return "__"
        break;
    }
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
    }]
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
      backgroundColor: paletaCores.slice(0, 2),
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

  const labelsMetasFinanceiras = dadosMetasFinanceiras.map((m) => m.nome);

  const valorAportesPorMeta = dadosMetasFinanceiras.map((metaFinanceira) => {
    const totalAportes = (aportesFiltrados || [])
      .filter((aporte) => String(aporte.idMetaFinanceira) === String(metaFinanceira.id))
      .reduce((soma, aporte) => soma + Number(aporte.valor), 0);
    return totalAportes;
  });

  const dadosGraficoBarrasAportes = {
    labels: labelsMetasFinanceiras,
    datasets: [{
      label: 'Aportes por Meta Financeira',
      data: valorAportesPorMeta,
      backgroundColor: paletaCores
    }]
  };

  const opcoesGraficoBarraVertical = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: { display: false },
    }
  };

  return (
    <div className='container'>
      <Card title='Relatório Mensal' icon='bi bi-bank'>
        <p className='text-muted'>Total de seus dados financeiros no mês de {formatarMes(filtroMes)}/{formatarAno(filtroAno)}</p>
        <strong style={{color: '#9329ed'}}>Selecione o período:</strong>
        <Stack spacing={2} direction="row" alignItems="center" marginTop={2}>
          <label><strong>Mês:</strong></label>
          <select
            className="form-select"
            style={{ width: 150 }}
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="1">Janeiro</option>
            <option value="2">Fevereiro</option>
            <option value="3">Março</option>
            <option value="4">Abril</option>
            <option value="5">Maio</option>
            <option value="6">Junho</option>
            <option value="7">Julho</option>
            <option value="8">Agosto</option>
            <option value="9">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>

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

        <Stack spacing={1} direction="row" >
          <Card title='Receitas'>
            <Pie data={dadosGraficoPizzaCategoriasR} options={opcoesGraficoPizza} />
          </Card>
          <Card title='Despesas'>
            <Pie data={dadosGraficoPizzaCategoriasD} options={opcoesGraficoPizza} />
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
          <Card title='Aportes por Meta Financeira' style={{ sizeHeight: '400px' }}>
            <Bar data={dadosGraficoBarrasAportes} options={opcoesGraficoBarraVertical} />
          </Card>
        </Stack>

      </Card>
    </div>
  );
}

export default RelatorioMensal;
