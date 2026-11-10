import type { Locator, Page } from '@playwright/test';

export class AppPage {
  readonly result: Locator;
  readonly loginError: Locator;

  constructor(private readonly page: Page) {
    this.result = page.getByTestId('result');
    this.loginError = page.getByTestId('login-error');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(email: string, password: string) {
    await this.page.getByTestId('email').fill(email);
    await this.page.getByTestId('password').fill(password);
    await this.page.getByTestId('login-btn').click();
  }

  async calculate(hours: number, rate: number, expenses: number) {
    await this.page.getByTestId('hours').fill(String(hours));
    await this.page.getByTestId('rate').fill(String(rate));
    await this.page.getByTestId('expenses').fill(String(expenses));
    await this.page.getByTestId('calc-btn').click();
  }
}
