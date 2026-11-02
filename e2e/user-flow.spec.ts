import { readFile } from 'node:fs/promises';
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

async function expectResult(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/result$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Result', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Salary', exact: true }),
  ).toContainText('$5,000');
  await expect(
    page
      .getByRole('region', { name: 'Housing', exact: true })
      .getByRole('listitem')
      .filter({
        has: page.getByRole('heading', {
          level: 3,
          name: 'Rent',
          exact: true,
        }),
      }),
  ).toContainText('$2,000');
  await expect(
    page
      .getByRole('region', { name: 'Hobbies', exact: true })
      .getByRole('listitem')
      .filter({
        has: page.getByRole('heading', {
          level: 3,
          name: 'Travel',
          exact: true,
        }),
      }),
  ).toContainText('$1,800');
  await expect(
    page.getByRole('region', { name: 'Remaining', exact: true }),
  ).toContainText('$1,200');
}

test(
  'user flow from salary to JSON round trip',
  async ({ page, browser, baseURL }, testInfo) => {
    const exportPath = testInfo.outputPath('finance-fe-v0.json');

    await test.step('enter salary', async () => {
      await page.goto('/salary');
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: "What's your gross salary?",
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole('textbox', { name: 'Gross salary', exact: true })
        .fill('5000');
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await expect(page).toHaveURL(/\/budgets$/);
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: 'Your budgets',
          exact: true,
        }),
      ).toBeVisible();
    });

    await test.step('add fixed budget', async () => {
      await addBudget(page, {
        name: 'Rent',
        category: 'Housing',
        type: 'Fixed',
        value: '2000',
      });
      const housing = page.getByRole('region', {
        name: 'Housing',
        exact: true,
      });
      await expect(housing).toContainText('Rent');
      await expect(housing).toContainText('Fixed · $2,000 / month');
    });

    await test.step('add percentage budget', async () => {
      await addBudget(page, {
        name: 'Travel',
        category: 'Hobbies',
        type: 'Percentage',
        value: '60',
      });
      const hobbies = page.getByRole('region', {
        name: 'Hobbies',
        exact: true,
      });
      await expect(hobbies).toContainText('Travel');
      await expect(hobbies).toContainText('Percentage · 60%');
    });

    await test.step('view result', async () => {
      await page
        .getByRole('button', { name: 'See result', exact: true })
        .click();
      await expectResult(page);
    });

    await test.step('export JSON', async () => {
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export', exact: true }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('finance-fe-v0.json');
      await download.saveAs(exportPath);
      const parsed = JSON.parse(await readFile(exportPath, 'utf8')) as unknown;
      expect(parsed).toEqual({
        version: 'v0',
        salary: 5000,
        budgets: [
          expect.objectContaining({
            id: expect.any(String),
            name: 'Rent',
            type: 'fixed',
            value: 2000,
            category: 'Housing',
          }),
          expect.objectContaining({
            id: expect.any(String),
            name: 'Travel',
            type: 'percentage',
            value: 60,
            category: 'Hobbies',
          }),
        ],
      });
    });

    await test.step('import JSON', async () => {
      const context = await browser.newContext({ baseURL });
      const importPage = await context.newPage();
      await importPage.goto('/salary');
      const fileChooserPromise = importPage.waitForEvent('filechooser');
      await importPage
        .getByRole('button', { name: 'Import JSON', exact: true })
        .click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(exportPath);
      await expectResult(importPage);
      await context.close();
    });
  },
);
