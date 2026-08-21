import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear()
  })
})

test('loads the game shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('click-target')).toBeVisible()
  await expect(page.getByTestId('kill-counter')).toBeVisible()
  await expect(page.getByRole('button', { name: /EN|RU/i }).first()).toBeVisible()
})

test('clicking the zombie increases the kill counter', async ({ page }) => {
  await page.goto('/')
  const counter = page.getByTestId('kill-coefficient')
  await expect(counter).toHaveText('0')

  await page.getByTestId('click-target').click()
  await expect(counter).not.toHaveText('0')
})

test('can buy the first weapon when affordable', async ({ page }) => {
  await page.goto('/')
  const target = page.getByTestId('click-target')
  for (let i = 0; i < 20; i += 1) {
    await target.click()
  }

  const firstWeapon = page.getByTestId('building-row').first()
  await expect(firstWeapon).toBeEnabled({ timeout: 10_000 })
  await firstWeapon.click()
  await expect(firstWeapon.locator('.building-row__owned')).toHaveText('1')
})
