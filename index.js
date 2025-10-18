const express = require('express');
const mysql = require('mysql2/promise');
const ical = require('ical.js');
const axios = require('axios');
const i18n = require('i18n');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);

i18n.configure({
    locales: ['es', 'ca', 'en'],
    directory: path.join(__dirname, 'public/data'),
    defaultLocale: 'es',
    queryParameter: 'lang',
    objectNotation: true
});

app.post('/api/submit', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
  try {
    const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'casa_vacacional' });
    await connection.execute('INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
    await connection.end();
    res.status(200).json({ message: 'Submission successful' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/calendar', async (req, res) => {
  try {
    const response = await axios.get('YOUR_AIRBNB_ICAL_URL');
    const data = ical.parse(response.data);
    const comp = new ical.Component(data);
    const events = comp.getAllSubcomponents('vevent').map(event => {
      const vevent = new ical.Event(event);
      return { title: vevent.summary, start: vevent.startDate.toJSDate(), end: vevent.endDate.toJSDate() };
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Calendar error' });
  }
});

app.get('/api/translate', (req, res) => {
  const locale = req.query.lang || 'es';
  req.setLocale(locale);
  res.json({
    nav: { title: req.__('nav.title'), subtitle: req.__('nav.subtitle') },
    contact: { title: req.__('contact.title'), name: req.__('contact.name'), email: req.__('contact.email'), message: req.__('contact.message'), submit: req.__('contact.submit') },
    availability: { title: req.__('availability.title') }
  });
});

app.listen(3000, () => console.log('Server on http://localhost:3000'));