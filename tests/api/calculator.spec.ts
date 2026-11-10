import { test, expect } from '@playwright/test';

const VALID_USER = { email: 'jorge@demo.com', password: 'secret123' };

test.describe('API /api/login', () => {
  test('login correcto responde 200', async ({ request }) => {
    const res = await request.post('/api/login', { data: VALID_USER });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test('login incorrecto responde 401', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { email: 'jorge@demo.com', password: 'mala' },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('API /api/calculate', () => {
  test('sin sesión responde 401', async ({ request }) => {
    const res = await request.post('/api/calculate', {
      data: { hours: 100, rate: 30, expenses: 1000 },
    });
    expect(res.status()).toBe(401);
  });

  test('cálculo válido devuelve gross, net, needed e independent', async ({ request }) => {
    await request.post('/api/login', { data: VALID_USER });
    const res = await request.post('/api/calculate', {
      data: { hours: 100, rate: 30, expenses: 1000 },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({
      gross: 3000,
      net: 2000,
      needed: 1300,
      independent: true,
    });
  });

  test('valores negativos responden 400', async ({ request }) => {
    await request.post('/api/login', { data: VALID_USER });
    const res = await request.post('/api/calculate', {
      data: { hours: -5, rate: 30, expenses: 1000 },
    });
    expect(res.status()).toBe(400);
  });
});
