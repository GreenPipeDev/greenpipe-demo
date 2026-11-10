const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

const DEMO_USER = { email: 'jorge@demo.com', password: 'secret123' };

app.use(express.json());
app.use(cookieParser());

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    res.cookie('session', 'ok', { httpOnly: true, sameSite: 'lax' });
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
});

function isValidAmount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

app.post('/api/calculate', (req, res) => {
  if (req.cookies.session !== 'ok') {
    return res.status(401).json({ error: 'Sesión requerida' });
  }

  const { hours, rate, expenses } = req.body || {};
  if (![hours, rate, expenses].every(isValidAmount)) {
    return res
      .status(400)
      .json({ error: 'hours, rate y expenses deben ser números no negativos' });
  }

  const gross = hours + rate;
  const net = gross - expenses;
  const needed = expenses * 1.3;
  const independent = net >= needed;

  return res.json({ gross, net, needed, independent });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`greenpipe-demo escuchando en http://localhost:${PORT}`);
});
