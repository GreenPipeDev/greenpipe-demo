import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('UI de la calculadora', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    await app.goto();
  });

  test('login fallido muestra "Credenciales inválidas"', async () => {
    await app.login('jorge@demo.com', 'mala');
    await expect(app.loginError).toHaveText('Credenciales inválidas');
  });

  test('100 h a 30 con 1000 de gastos: eres independiente', async () => {
    await app.login('jorge@demo.com', 'secret123');
    await app.calculate(100, 30, 1000);
    await expect(app.result).toContainText('¡Eres independiente!');
  });

  test('20 h a 30 con 1000 de gastos: necesitas al menos', async () => {
    await app.login('jorge@demo.com', 'secret123');
    await app.calculate(20, 30, 1000);
    await expect(app.result).toContainText('Necesitas al menos');
  });
});
