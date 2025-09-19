export default {
  translation: {
    appName: 'Spendless',
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
    },
    auth: {
      signout: {
        title: 'Sair',
        message: 'Tem certeza que deseja sair?',
      },
    },
    spending: {
      noPeriodSelected: 'Nenhum período selecionado',
      tapToCreatePeriod: 'Toque para criar um novo período',
      activePeriod: 'Ativo',
      closedPeriod: 'Fechado',
      switchPeriod: 'Trocar período',
      currentPeriod: 'Período atual',
      to: 'até',
      periodClosed: 'Período fechado',
      lastDay: 'Último dia',
      dayRemaining: '{{count}} dia restante',
      daysRemaining: '{{count}} dias restantes',
      newSpend: 'Novo Gasto',
    },
    periods: {
      title: 'Períodos de Gastos',
      description: '{{startDate}} até {{endDate}}',
      noPeriods: 'Nenhum período de gastos encontrado.',
      currentPeriod: 'Período Atual',
      pastPeriods: 'Períodos Passados',
      noCurrentPeriod: 'Nenhum período ativo',
      noPastPeriods: 'Nenhum período passado encontrado.',
      empty: {
        description: 'Comece a rastrear seus gastos criando seu primeiro período.',
      },
    },
    wallet: {
      noWalletSelected: 'Nenhuma carteira selecionada',
      selectWalletToViewSpending:
        'Por favor, selecione uma carteira para ver os detalhes de gastos.',
      noSpendingInWallet: 'Nenhum gasto nesta carteira',
      noSpendingInWalletDescription:
        'Comece a rastrear gastos em {{walletName}} adicionando sua primeira entrada de gasto.',
      backToSpending: 'Voltar aos Gastos',
      editWallet: 'Editar Carteira',
    },
    meta: {
      title: '{{title}} - {{appName}}',
      defaultTitle: '{{appName}} - Um rastreador de gastos consciente',
    },
  },
};
