const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const { expressjwt } = require("express-jwt");
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const PORT = 3000;

const secretKey = "My super secret key";
const jwtMW = expressjwt({
    secret: secretKey,
    algorithms: ['HS256'],
    requestProperty: 'auth'
});

let users = [
    {
        id: 1,
        username: 'maria',
        password: '2017'
    },
    {
        id: 2,
        username: 'Rachel',
        password: '2019'
    }
]

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
        res.json({
            success: true,
            err: null,
            token
        });
    } else {
        res.status(401).json({
            success: false,
            token: null,
            err: 'Username or password is incorrect'
        });
    }
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'you are in the dashboard'
    });
});
    
app.get('/api/prices', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'this is the price $3.99'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is your settings'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle specific client-side routes
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ 
            success: false,
            officialError: err.message,
            err: 'Token is invalid or missing'
        });
    }
    else {
        console.error('Server error:', err);
        res.status(500).json({
            success: false,
            err: 'unauthorized access 2'
        });
    }
})

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});