import React, { useState, useEffect } from 'react';
import Card from '../components/card';
import Stack from '@mui/material/Stack';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import '../custom.css';
import { mensagemErro } from '../components/toastr';
import api from '../config/axios';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function RelatorioAdmin() {
  const [clientes, setClientes] = useState([]);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDadosPlataforma() {
      try {
        // Busca todos os usuários e dados vitais do sistema (sem filtro de usuário logado)
        const [clientesRes, receitasRes, despesasRes] = await Promise.all([
          api.get('/clientes'),
          api.get('/receitas'),
          api.get('/despesas')
        ]);

        setClientes(clientesRes.data || []);
        // Apenas para métrica de volume de uso do sistema
        setTotalReceitas(receitasRes.data?.length || 0);
        setTotalDespesas(despesasRes.data?.length || 0);

      } catch (error) {
        console.error('Erro ao buscar dados do sistema:', error);
        mensagemErro('Erro ao carregar o dashboard administrativo.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosPlataforma();
  }, []);

  if (carregando) {
    return (
      <div className="container mt-5 text-center">
        <p>Coletando métricas gerais do sistema...</p>
      </div>
    );
  }

  // Cálculos para os gráficos
  const totalAdmins = clientes.filter(c => c.admin).length;
  const totalComuns = clientes.filter(c => !c.admin).length;
  const totalMovimentacoes = totalReceitas + totalDespesas;

  const dadosGraficoUsuarios = {
    labels: ['Administradores', 'Usuários Comuns'],
    datasets: [{
      data: [totalAdmins, totalComuns],
      backgroundColor: ['#dc3545', '#0dcaf0'], // Cores seguindo o padrão Bootstrap (Danger/Info)
      borderWidth: 0,
      cutout: '60%'
    }]
  };

  const opcoesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  return (
    <div className='container mb-5'>
      <Card title='Visão Administrativa Geral' icon='bi bi-graph-up-arrow'>
        <p className='text-muted'>Métricas e saúde geral da plataforma FinanceTrack</p>

        <Stack spacing={3} direction="row" sx={{ mb: 4, mt: 3 }}>
          <div className="resumo-card p-3 border rounded shadow-sm text-center" style={{ flex: 1 }}>
            <span className="resumo-titulo d-block text-muted mb-2">Total de Contas</span>
            <span className="fs-3 fw-bold text-primary">
              <i className="bi bi-people-fill me-2"></i>{clientes.length}
            </span>
          </div>

          <div className="resumo-card p-3 border rounded shadow-sm text-center" style={{ flex: 1 }}>
            <span className="resumo-titulo d-block text-muted mb-2">Total de Lançamentos na Base</span>
            <span className="fs-3 fw-bold text-success">
              <i className="bi bi-database-fill me-2"></i>{totalMovimentacoes}
            </span>
          </div>
        </Stack>

        <div className="row g-4">
          <div className="col-md-6 offset-md-3">
            <Card title='Distribuição de Perfis'>
              <div style={{ height: '300px', position: 'relative' }}>
                <Doughnut data={dadosGraficoUsuarios} options={opcoesGrafico} />
              </div>
            </Card>
          </div>
        </div>

      </Card>
    </div>
  );
}

export default RelatorioAdmin;