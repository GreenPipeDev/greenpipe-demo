# greenpipe-demo

Demo de **GreenPipe**: una app pequeña con sus tests automatizados y un pipeline que, cuando algo se rompe en un pull request, comenta la causa probable y el arreglo usando IA.

- Landing: https://greenpipedev.github.io/greenpipe-demo/
- Tests: [![Tests](https://github.com/GreenPipeDev/greenpipe-demo/actions/workflows/tests.yml/badge.svg)](https://github.com/GreenPipeDev/greenpipe-demo/actions/workflows/tests.yml)

## Qué hay dentro

| Ruta | Qué es |
| --- | --- |
| `server.js` | App Express con login por cookie y una calculadora de independencia económica |
| `public/index.html` | Página con el login y la calculadora |
| `tests/api/` | Tests de API con Playwright |
| `tests/ui/` | Tests de interfaz con Playwright |
| `pages/AppPage.ts` | Page object que usan los tests de interfaz |
| `scripts/analyze-failures.ts` | Envía los fallos a Claude y comenta en el PR |
| `.github/workflows/tests.yml` | Pipeline que corre en cada pull request |
| `.github/workflows/pages.yml` | Publica `site/` en GitHub Pages |
| `site/` | Landing de GreenPipe |

## La app

**`POST /api/login`** acepta `{ "email": "jorge@demo.com", "password": "secret123" }`, responde `{ "ok": true }` y deja la cookie `session=ok`. Cualquier otra credencial responde `401`. Son credenciales de demostración, no protegen nada real.

**`POST /api/calculate`** necesita la cookie de sesión (si no, `401`). Recibe `{ hours, rate, expenses }` y responde `400` si algún valor es negativo o no es un número. El cálculo:

```
gross       = hours * rate
net         = gross - expenses
needed      = expenses * 1.3
independent = net >= needed
```

Ejemplo: 100 horas a 30 con 1000 de gastos da `{ gross: 3000, net: 2000, needed: 1300, independent: true }`.

## Cómo correrlo

Necesitas Node 18 o superior (el pipeline usa Node 20).

```bash
npm install
npx playwright install chromium
npm start
```

Abre http://localhost:3000 y entra con las credenciales de demostración.

Para los tests no hace falta arrancar el servidor: Playwright lo levanta solo.

```bash
npm test          # todos
npm run test:api  # solo API
npm run test:ui   # solo interfaz
npm run report    # abre el reporte HTML del último run
```

Cada ejecución deja el reporte HTML en `playwright-report/` y los resultados en `test-results.json`. En CI hay 2 reintentos; el trace y la captura se guardan solo cuando un test falla.

## Cómo funciona el análisis de fallos con IA

En cada pull request, `.github/workflows/tests.yml` hace esto:

1. Instala Node 20, las dependencias (`npm ci`) y los navegadores de Playwright.
2. Corre los tests con `continue-on-error`, para que el job siga aunque fallen.
3. Sube `playwright-report/` como artifact.
4. **Si hubo fallos**, ejecuta `scripts/analyze-failures.ts`, que:
   - lee `test-results.json` y se queda con los tests fallidos (título, archivo, mensaje y stack);
   - los envía a la API de Anthropic pidiendo, en español, la causa probable y un arreglo concreto;
   - publica la respuesta como comentario en el PR con la API de GitHub.
5. Marca el check en rojo, para que un PR con tests rotos no parezca sano.

El comentario es una hipótesis para ahorrarte la lectura de logs: revísala antes de aplicar el arreglo.

### Configuración

El script usa estas variables de entorno:

| Variable | De dónde sale |
| --- | --- |
| `ANTHROPIC_API_KEY` | Secret del repositorio (lo creas tú, ver abajo) |
| `GITHUB_TOKEN` | Lo aporta GitHub Actions; el workflow pide `pull-requests: write` |
| `PR_NUMBER` | Número del PR, lo pasa el workflow |
| `ANTHROPIC_MODEL` | Opcional. Variable del repositorio para cambiar de modelo |

Guarda tu clave de Anthropic como secret (el comando te la pide sin mostrarla):

```bash
gh secret set ANTHROPIC_API_KEY --repo GreenPipeDev/greenpipe-demo
```

El modelo por defecto es `claude-sonnet-4-5`. Anthropic lo retira el 30 de noviembre de 2026; para pasar a uno vigente sin tocar código:

```bash
gh variable set ANTHROPIC_MODEL --body "claude-sonnet-5-5" --repo GreenPipeDev/greenpipe-demo
```

Para probar el script en tu máquina, rompe algo, corre los tests y lánzalo. Sin `GITHUB_TOKEN` ni `PR_NUMBER` imprime el análisis en la terminal en vez de comentar:

```bash
npm test
ANTHROPIC_API_KEY=tu-clave npm run analyze
```

### Verlo en acción

La rama `demo-failure` cambia a propósito `gross = hours * rate` por `gross = hours + rate`. Su pull request muestra el pipeline en rojo y el comentario de IA señalando la línea culpable.

## La landing

`site/index.html` es una sola página con CSS inline. `pages.yml` la publica en GitHub Pages en cada push a `main` que toque `site/`.
