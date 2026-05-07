import express from 'express';

const app = express();

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'express-health-service'
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
