import { expect, test } from '@playwright/test'

test('renders catalog page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Productos disponibles' }))
    .toBeVisible()
  await expect(page.getByRole('link', { name: /E-Commerce/ }))
    .toBeVisible()
})
