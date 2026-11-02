import { type Translation } from './en';

export const ptBR: Translation = {
  app: {
    title: 'App de Finanças do Bosi',
  },
  common: {
    cancel: 'Cancelar',
    close: 'Fechar',
    delete: 'Excluir',
    save: 'Salvar',
    seeResult: 'Ver resultado',
  },
  nav: {
    salary: 'Salário',
    budgets: 'Orçamentos',
    result: 'Resultado',
    import: 'Importar',
    export: 'Exportar',
    importFileLabel: 'Importar arquivo',
  },
  salary: {
    titleNew: 'Qual é o seu salário bruto?',
    titleSaved: 'Seu salário bruto',
    hintNew: 'Seu ponto de partida. Depois, você vai dividi-lo em orçamentos.',
    hintSaved:
      'Atualize quando quiser — os orçamentos são recalculados na hora.',
    label: 'Salário bruto',
    continue: 'Continuar',
    importJson: 'Importar JSON',
    importJsonFileLabel: 'Importar arquivo JSON',
    addBudgets: 'Adicionar orçamentos',
  },
  budgets: {
    title: 'Seus orçamentos',
    emptyHint:
      'Nenhum orçamento ainda. Adicione o primeiro para dividir seu salário.',
    listHint: 'Adicione, edite e exclua orçamentos fixos e percentuais.',
    add: 'Adicionar orçamento',
    deleteNamed: 'Excluir {{name}}',
    editNamed: 'Editar {{name}}',
  },
  budgetForm: {
    addTitle: 'Adicionar orçamento',
    editTitle: 'Editar orçamento',
    nameLabel: 'Nome',
    namePlaceholder: 'Nome do orçamento',
    categoryLabel: 'Categoria',
    categoryPlaceholder: 'Selecione uma categoria',
    newCategory: 'Nova categoria',
    addNewCategory: '+ Adicionar nova categoria',
    newCategoryPlaceholder: 'Nome da categoria',
    typeLabel: 'Tipo',
    typePlaceholder: 'Selecione um tipo',
    typeFixed: 'Fixo',
    typePercentage: 'Percentual',
    valueLabel: 'Valor',
  },
  deleteBudget: {
    title: 'Excluir {{name}}?',
    body: 'Essa ação não pode ser desfeita.',
  },
  result: {
    title: 'Resultado',
    salary: 'Salário',
    remaining: 'Restante',
    editBudgets: 'Editar orçamentos',
  },
  validation: {
    budgetNameRequired: 'Informe o nome do orçamento.',
    budgetTypeRequired: 'Escolha o tipo do orçamento.',
    budgetCategoryRequired: 'Escolha uma categoria.',
    fixedValueInvalid: 'Informe um valor acima de {{min}}.',
    percentageValueInvalid: 'Informe um percentual entre 0 e 100.',
    salaryRequired: 'Informe seu salário bruto.',
    salaryInvalid: 'Informe um valor de {{min}} ou mais.',
  },
  toast: {
    storageFailed: 'Não foi possível salvar seus dados neste navegador.',
    importFailed: 'A importação falhou. Seus dados não foram alterados.',
  },
  plan: {
    percentageOver:
      'Os percentuais somam {{total}} — devem ser {{max}} ou menos.',
    fixedOverSalary: 'Os orçamentos fixos excedem o salário em {{excess}}.',
  },
  format: {
    detailsFixed: 'Fixo · {{amount}} / mês',
    detailsPercentage: 'Percentual · {{percent}}',
  },
};
