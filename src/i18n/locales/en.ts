export const en = {
  app: {
    title: "Bosi's Finance App",
  },
  common: {
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    save: 'Save',
    seeResult: 'See result',
  },
  nav: {
    salary: 'Salary',
    budgets: 'Budgets',
    result: 'Result',
    import: 'Import',
    export: 'Export',
    importFileLabel: 'Import file',
  },
  salary: {
    titleNew: "What's your gross salary?",
    titleSaved: 'Your gross salary',
    hintNew: "Your starting point. Next, you'll split it into budgets.",
    hintSaved: 'Update it anytime — budgets recalculate instantly.',
    label: 'Gross salary',
    continue: 'Continue',
    importJson: 'Import JSON',
    importJsonFileLabel: 'Import JSON file',
    addBudgets: 'Add budgets',
  },
  budgets: {
    title: 'Your budgets',
    emptyHint: 'No budgets yet. Add your first one to split your salary.',
    listHint: 'Add, edit, and delete fixed and percentage budgets.',
    add: 'Add budget',
    deleteNamed: 'Delete {{name}}',
    editNamed: 'Edit {{name}}',
  },
  budgetForm: {
    addTitle: 'Add budget',
    editTitle: 'Edit budget',
    nameLabel: 'Name',
    namePlaceholder: 'Budget name',
    categoryLabel: 'Category',
    categoryPlaceholder: 'Select a category',
    newCategory: 'New category',
    addNewCategory: '+ Add new category',
    newCategoryPlaceholder: 'Category name',
    typeLabel: 'Type',
    typePlaceholder: 'Select a type',
    typeFixed: 'Fixed',
    typePercentage: 'Percentage',
    valueLabel: 'Value',
  },
  deleteBudget: {
    title: 'Delete {{name}}?',
    body: "This can't be undone.",
  },
  result: {
    title: 'Result',
    salary: 'Salary',
    remaining: 'Remaining',
    editBudgets: 'Edit budgets',
  },
  validation: {
    budgetNameRequired: 'Enter a budget name.',
    budgetTypeRequired: 'Choose a budget type.',
    budgetCategoryRequired: 'Choose a category.',
    fixedValueInvalid: 'Enter an amount above {{min}}.',
    percentageValueInvalid: 'Enter a percentage between 0 and 100.',
    salaryRequired: 'Enter your gross salary.',
    salaryInvalid: 'Enter an amount of {{min}} or more.',
  },
  toast: {
    storageFailed: 'Your data could not be saved in this browser.',
    importFailed: 'Import failed. Your data was not changed.',
  },
  plan: {
    percentageOver: 'Percentages sum to {{total}} — must be {{max}} or less.',
    fixedOverSalary: 'Fixed budgets exceed the salary by {{excess}}.',
  },
  format: {
    detailsFixed: 'Fixed · {{amount}} / month',
    detailsPercentage: 'Percentage · {{percent}}',
  },
} as const;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Translation = Widen<typeof en>;
