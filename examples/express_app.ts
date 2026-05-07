import express from 'express';
import axios from 'axios';

const app = express();

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.post('/submit', async (req, res) => {
    await axios.post('https://api.example.com/log', req.body);
    res.json({ ok: true });
});
