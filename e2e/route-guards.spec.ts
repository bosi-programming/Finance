import { expect, test, type Page } from '@playwright/test';

async function addBudget(
  page: Page,
  budget: {
    name: string;
    category: string;
    type: 'Fixed' | 'Percentage';
    value: string;
  },
): Promise<void> {
  await page.getByRole('button', { name: 'Add budget', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Add budget', exact: true });
  await dialog
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill(budget.name);
  await dialog.getByRole('combobox', { name: 'Category', exact: true }).click();
  await page
    .getByRole('option', { name: '+ Add new category', exact: true })
    .click();
  await dialog
    .getByRole('textbox', { name: 'New category', exact: true })
    .fill(budget.category);
  await dialog.getByRole('combobox', { name: 'Type', exact: true }).click();
  await page.getByRole('option', { name: budget.type, exact: true }).click();
  await dialog
    .getByRole('textbox', { name: 'Value', exact: true })
    .fill(budget.value);
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(dialog).toBeHidden();
}

test('redirects a fresh /result and keeps /result on reload', async ({
  page,
}) => {
  await page.goto('/result');
  await expect(page).toHaveURL(/\/salary$/);

  await page
    .getByRole('textbox', { name: 'Gross salary', exact: true })
    .fill('5000');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/\/budgets$/);
  await addBudget(page, {
    name: 'Rent',
    category: 'Housing',
    type: 'Fixed',
    value: '2000',
  });
  await page.goto('/result');
  await expect(page).toHaveURL(/\/result$/);

  await page.reload();

  await expect(page).toHaveURL(/\/result$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Result', exact: true }),
  ).toBeVisible();
});
