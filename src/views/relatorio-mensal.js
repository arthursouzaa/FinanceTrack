import React, { useState, useEffect } from 'react';
import Card from '../components/card';
import Stack from '@mui/material/Stack';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

import '../custom.css';
import { mensagemErro } from '../components/toastr';
import api from '../config/axios';
import { filtrarRegistrosDoUsuario } from '../utils/usuarioLogado';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function RelatorioMensal() {
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [aportes, setAportes] = useState([]);
  const [dadosCategoriasReceita, setDadosCategoriasReceita] = useState([]);
  const [dadosCategoriasDespesa, setDadosCategoriasDespesa] = useState([]);
  const [dadosMetasFinanceiras, setDadosMetasFinanceiras] = useState([]);
  
  const [filtroMes, setFiltroMes] = useState('Todos');
  const [filtroAno, setFiltroAno] = useState('Todos');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDadosRelatorio() {
      try {
        const [
          receitasRes, 
          despesasRes, 
          aportesRes, 
          catReceitasRes, 
          catDespesasRes, 
          metasRes
        ] = await Promise.all([
          api.get('/receitas'),
          api.get('/despesas'),
          api.get('/aportes'),
          api.get('/categoriasReceita'),
          api.get('/categoriasDespesa'),
          api.get('/metasFinanceiras')
        ]);

        setReceitas(filtrarRegistrosDoUsuario(receitasRes.data));
        setDespesas(filtrarRegistrosDoUsuario(despesasRes.data));
        setAportes(filtrarRegistrosDoUsuario(aportesRes.data));
        setDadosCategoriasReceita(catReceitasRes.data || []);
        setDadosCategoriasDespesa(catDespesasRes.data || []);
        setDadosMetasFinanceiras(metasRes.data || []);

      } catch (error) {
        console.error('Erro ao carregar dados do relatório:', error);
        mensagemErro('Erro ao carregar os dados dos gráficos financeiros.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosRelatorio();
  }, []);

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

      const mes = new Date(dado.data).getUTCMonth() + 1;
      const ano = new Date(dado.data).getUTCFullYear();

      const filtraMes = filtroMes === 'Todos' || mes === Number(filtroMes);
      const filtraAno = filtroAno === 'Todos' || ano === Number(filtroAno);

      return filtraMes && filtraAno;
    });
  }

  function obterAnosDisponiveis() {
    const todasDatas = [...receitas, ...despesas, ...aportes]
      .filter(l => l.data)
      .map(l => new Date(l.data).getUTCFullYear());

    const anosUnicos = [...new Set(todasDatas)];
    return anosUnicos.sort((a, b) => b - a);
  }

  function somarValores(lista) {
    return lista.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatarMes(mes) {
    const meses = {
      "1": "Janeiro", "2": "Fevereiro", "3": "Março", "4": "Abril",
      "5": "Maio", "6": "Junho", "7": "Julho", "8": "Agosto",
      "9": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
    };
    return meses[mes] || "Todos os Meses";
  }

  if (carregando) {
    return (
      <div className="container mt-5 text-center">
        <p>Processando dados e gerando gráficos...</p>
      </div>
    );
  }

  const receitasFiltradas = obterDadosFiltrados(receitas);
  const despesasFiltradas = obterDadosFiltrados(despesas);
  const aportesFiltrados = obterDadosFiltrados(aportes);

  const totalReceitas = somarValores(receitasFiltradas);
  const totalDespesas = somarValores(despesasFiltradas);

  const labelsReceitas = dadosCategoriasReceita.map((c) => c.nome);
  const valoresPorCategoriasReceita = dadosCategoriasReceita.map((categoria) => {
    return receitasFiltradas
      .filter((r) => String(r.idCategoriaReceita || r.categoriaReceita?.id) === String(categoria.id))
      .reduce((soma, r) => soma + Number(r.valor || 0), 0);
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
      .filter((d) => String(d.idCategoriaDespesa || d.categoriaDespesa?.id) === String(categoria.id))
      .reduce((soma, d) => soma + Number(d.valor || 0), 0);
  });

  const dadosGraficoPizzaCategoriasD = {
    labels: labelsDespesas,
    datasets: [{
      label: 'Categorias de Despesas',
      data: valoresPorCategoriasDespesa,
      backgroundColor: paletaCores,
      borderWidth: 0,
    }]
  };

  const opcoesGraficoPizza = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right', labels: { boxWidth: 15, boxHeight: 15 } },
    }
  };

  const fixas = despesasFiltradas.filter((d) => d.volume === true || d.fixa === true).length;
  const naoFixas = despesasFiltradas.filter((d) => !d.volume && !d.fixa).length;

  const dadosGraficoBarrasVolume = {
    labels: ['Fixas', 'Variáveis'],
    datasets: [{
      label: 'Quantidade de Despesas',
      data: [fixas, naoFixas],
      backgroundColor: paletaCores.slice(0, 2),
    }]
  };

  const labelsMetasFinanceiras = dadosMetasFinanceiras.map((m) => m.nome);
  const valorAportesPorMeta = dadosMetasFinanceiras.map((meta) => {
    return aportesFiltrados
      .filter((aporte) => String(aporte.idMetaFinanceira || aporte.metaFinanceira?.id) === String(meta.id))
      .reduce((soma, aporte) => soma + Number(aporte.valor || 0), 0);
  });

  const dadosGraficoBarrasAportes = {
    labels: labelsMetasFinanceiras,
    datasets: [{
      label: 'Aportes (R$)',
      data: valorAportesPorMeta,
      backgroundColor: paletaCores
    }]
  };

  return (
    <div className='container mb-5'>
      <Card title='Relatório Mensal' icon='bi bi-bank'>
        <p className='text-muted'>
          Análise financeira referente ao período de: <strong>{formatarMes(filtroMes)} / {filtroAno === 'Todos' ? 'Todos os Anos' : filtroAno}</strong>
        </p>
        
        <Stack spacing={2} direction="row" alignItems="center" marginTop={2} marginBottom={4}>
          <label><strong>Mês:</strong></label>
          <select className="form-select" style={{ width: 160 }} value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
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

          <label className='ms-3'><strong>Ano:</strong></label>
          <select className="form-select" style={{ width: 130 }} value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)}>
            <option value="Todos">Todos</option>
            {obterAnosDisponiveis().map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </Stack>

        <Stack spacing={3} direction="row" sx={{ mb: 4 }}>
          <div className="resumo-card receita col-md-5"> 
            <span className="resumo-titulo">Total Receitas</span>
            <span className="resumo-valor positivo">{totalReceitas > 0 ? formatarMoeda(totalReceitas) : 'R$ 0,00'}</span>
          </div>

          <div className="resumo-card despesa col-md-5">
            <span className="resumo-titulo">Total Despesas</span>
            <span className="resumo-valor negativo">{totalDespesas > 0 ? formatarMoeda(totalDespesas) : 'R$ 0,00'}</span>
          </div>
        </Stack>

        <div className="row g-4">
          <div className="col-md-6">
            <Card title='Distribuição de Receitas'>
              <div style={{ height: '280px', position: 'relative' }}>
                <Pie data={dadosGraficoPizzaCategoriasR} options={opcoesGraficoPizza} />
              </div>
            </Card>
          </div>
          <div className="col-md-6">
            <Card title='Distribuição de Despesas'>
              <div style={{ height: '280px', position: 'relative' }}>
                <Pie data={dadosGraficoPizzaCategoriasD} options={opcoesGraficoPizza} />
              </div>
            </Card>
          </div>
        </div>

        <div className="row g-4 mt-2">
          <div className="col-md-6">
            <Card title='Volume das Despesas'>
              <div style={{ height: '220px', position: 'relative' }}>
                <Bar data={dadosGraficoBarrasVolume} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }} />
              </div>
            </Card>
          </div>
          <div className="col-md-6">
            <Card title='Aportes Realizados por Meta'>
              <div style={{ height: '220px', position: 'relative' }}>
                <Bar data={dadosGraficoBarrasAportes} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            </Card>
          </div>
        </div>

      </Card>
    </div>
  );
}

export default RelatorioMensal;