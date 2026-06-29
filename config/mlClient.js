"use strict";
const axios = require('axios');

const mlClient = axios.create({
    baseURL: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
    timeout: Number(process.env.ML_TIMEOUT || 15000),
    headers: { "Content-Type": "application/json" },
});

mlClient.interceptors.request.use((config) => {
    if (process.env.ML_API_KEY) {
        config.headers["x-api-key"] = process.env.ML_API_KEY;
    }

    return config;
})

module.exports = mlClient;