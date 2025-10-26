const express = require('express');
const mysql = require('mysql2/promise');
const ical = require('ical.js');
const axios = require('axios');
const i18n = require('i18n');
const path = require('path');
const acceptLanguage = require('accept-language');

const app = express();

// Static serving FIRST (best practice—handles /css, /js, /images without /public/)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(i18n.init);

acceptLanguage.languages(['es', 'ca', 'en']);

i18n.configure({
    locales: ['es', 'ca', 'en'],
    directory: path.join(__dirname, 'public/locales'),
    defaultLocale: 'ca',
    queryParameter: 'lang',
    objectNotation: true
});

// Import DB pool (from config)
const dbPool = require('./config/database');

// Shared function to generate translation object
function getTranslations(req, res) {
    return res.getCatalog();  // Full { gallery: { title: '...', exterior: '...' }, ... } from locales/{current-locale}.json
}

app.get('/', (req, res) => {
    const locale = req.query.lang || acceptLanguage.get(req.headers['accept-language']) || 'ca';
    req.setLocale(locale);
    res.render('index', {
        t: getTranslations(req, res),
        locale: locale
    });
});

app.get('/api/translate', (req, res) => {
    const locale = req.query.lang || 'ca';
    req.setLocale(locale);
    res.json(getTranslations(req, res));
});

app.post('/api/submit', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
    try {
        const [result] = await dbPool.execute('INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
        res.status(200).json({ success: true, message: 'Submission successful' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error: ' + error.code + "; " + error.message});
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

// 404 Catch-All
app.use((req, res) => {
    res.status(404).render('404', { t: req.t });  // Assume views/404.ejs; or send plain text
});

// Listen on PORT env or 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));