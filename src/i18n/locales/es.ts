import { type Translation } from './en';

export const es: Translation = {
  app: {
    title: 'App de Finanzas de Bosi',
  },
  common: {
    cancel: 'Cancelar',
    close: 'Cerrar',
    delete: 'Eliminar',
    save: 'Guardar',
    seeResult: 'Ver resultado',
  },
  nav: {
    salary: 'Salario',
    budgets: 'Presupuestos',
    result: 'Resultado',
    import: 'Importar',
    export: 'Exportar',
    importFileLabel: 'Importar archivo',
  },
  salary: {
    titleNew: '¿Cuál es tu salario bruto?',
    titleSaved: 'Tu salario bruto',
    hintNew: 'Tu punto de partida. Después, lo dividirás en presupuestos.',
    hintSaved:
      'Actualízalo cuando quieras — los presupuestos se recalculan al instante.',
    label: 'Salario bruto',
    continue: 'Continuar',
    importJson: 'Importar JSON',
    importJsonFileLabel: 'Importar archivo JSON',
    addBudgets: 'Añadir presupuestos',
  },
  budgets: {
    title: 'Tus presupuestos',
    emptyHint:
      'Todavía no hay presupuestos. Añade el primero para dividir tu salario.',
    listHint: 'Añade, edita y elimina presupuestos fijos y porcentuales.',
    add: 'Añadir presupuesto',
    deleteNamed: 'Eliminar {{name}}',
    editNamed: 'Editar {{name}}',
  },
  budgetForm: {
    addTitle: 'Añadir presupuesto',
    editTitle: 'Editar presupuesto',
    nameLabel: 'Nombre',
    namePlaceholder: 'Nombre del presupuesto',
    categoryLabel: 'Categoría',
    categoryPlaceholder: 'Selecciona una categoría',
    newCategory: 'Nueva categoría',
    addNewCategory: '+ Añadir nueva categoría',
    newCategoryPlaceholder: 'Nombre de la categoría',
    typeLabel: 'Tipo',
    typePlaceholder: 'Selecciona un tipo',
    typeFixed: 'Fijo',
    typePercentage: 'Porcentaje',
    valueLabel: 'Valor',
  },
  deleteBudget: {
    title: '¿Eliminar {{name}}?',
    body: 'Esta acción no se puede deshacer.',
  },
  result: {
    title: 'Resultado',
    salary: 'Salario',
    remaining: 'Restante',
    editBudgets: 'Editar presupuestos',
  },
  validation: {
    budgetNameRequired: 'Introduce el nombre del presupuesto.',
    budgetTypeRequired: 'Elige el tipo de presupuesto.',
    budgetCategoryRequired: 'Elige una categoría.',
    fixedValueInvalid: 'Introduce un importe superior a {{min}}.',
    percentageValueInvalid: 'Introduce un porcentaje entre 0 y 100.',
    salaryRequired: 'Introduce tu salario bruto.',
    salaryInvalid: 'Introduce un importe de {{min}} o más.',
  },
  toast: {
    storageFailed: 'No se pudieron guardar tus datos en este navegador.',
    importFailed: 'La importación falló. Tus datos no se modificaron.',
  },
  plan: {
    percentageOver:
      'Los porcentajes suman {{total}} — deben ser {{max}} o menos.',
    fixedOverSalary: 'Los presupuestos fijos superan el salario en {{excess}}.',
  },
  format: {
    detailsFixed: 'Fijo · {{amount}} / mes',
    detailsPercentage: 'Porcentaje · {{percent}}',
  },
};
