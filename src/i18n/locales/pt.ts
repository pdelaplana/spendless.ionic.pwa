export default {
  translation: {
    appName: 'Spendless',
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      errors: {
        default: 'Ocorreu um erro. Por favor, tente novamente mais tarde.',
        signinFailed:
          'Falha no login. Verifique suas credenciais ou entre em contato com o suporte.',
      },
    },
    server: {
      errors: {
        auth: {
          'auth/expired-action-code':
            'O código de redefinição de senha expirou. Por favor, solicite um novo.',
          'auth/invalid-action-code':
            'O código de redefinição de senha é inválido. Por favor, solicite um novo.',
          'auth/user-disabled': 'Esta conta de usuário foi desativada.',
          'auth/user-not-found': 'Conta de usuário não encontrada.',
          'auth/weak-password': 'A senha é muito fraca. Por favor, use uma senha mais forte.',
          'auth/email-already-in-use': 'Este e-mail já está em uso. Por favor, use um diferente.',
          'auth/popup-blocked':
            'O popup foi bloqueado pelo seu navegador. Por favor, permita popups para este site.',
          'auth/popup-closed-by-user': 'O login foi cancelado. Por favor, tente novamente.',
          'auth/cancelled-popup-request': 'Apenas um popup de login pode estar aberto por vez.',
          'auth/account-exists-with-different-credential':
            'Uma conta já existe com o mesmo endereço de e-mail, mas com um método de login diferente.',
        },
      },
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
      spendPerDay: 'Disponível por dia',
      actions: {
        title: 'Ações do Período',
        startNewPeriod: 'Iniciar Novo Período',
        editPeriod: 'Editar Período Atual',
      },
      newSpend: 'Novo Gasto',
      addFirstSpend: 'Adicione Seu Primeiro Gasto',
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
    insights: {
      title: 'Insights',
      description: 'Explore seus gastos para ver insights e tendências principais',
    },
    meta: {
      title: '{{title}} - {{appName}}',
      defaultTitle: '{{appName}} - Um rastreador de gastos consciente',
    },
    subscription: {
      // Tier names
      essentialsTier: 'Spendless Essentials',
      premiumTier: 'Spendless Premium',

      // Descriptions
      essentialsDescription: 'Plano gratuito com histórico de 30 dias',

      // Upgrade buttons
      upgradeMonthly: 'Atualizar Mensal ($8.99/mês)',
      upgradeAnnual: 'Atualizar Anual ($75/ano)',
      upgradeAnnualSave: 'Atualizar Anual (Economize 30%)',

      // Management
      manageSubscription: 'Gerenciar Assinatura',

      // Expiration
      expiresOn: 'Expira em {{date}}',
      renewsOn: 'Renova em {{date}}',
      subscriptionEndsOn: 'A assinatura termina em {{date}}',

      // Errors
      configurationError: 'Erro de configuração do Stripe. Entre em contato com o suporte.',
      upgradeError: 'Falha ao criar sessão de checkout. Tente novamente.',
      portalError: 'Falha ao abrir portal de assinatura. Tente novamente.',
    },
    pwa: {
      ios: {
        title: 'Instalar Spendless',
        description: 'Adicione à tela inicial para acesso rápido e melhor experiência.',
        step1: 'Toque no botão Compartilhar',
        step2: "Role e toque em 'Adicionar à Tela Inicial'",
        dismiss: 'Agora Não',
      },
    },
  },
};
