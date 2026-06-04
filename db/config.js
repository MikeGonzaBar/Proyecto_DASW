"use strict";

require("dotenv").config({ quiet: true });

const defaultDbName = "ProDASW";

function getDbName() {
    return process.env.DB_NAME || defaultDbName;
}

function getUrl() {
    if (process.env.MONGODB_URI) {
        return process.env.MONGODB_URI;
    }

    if (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST) {
        const user = encodeURIComponent(process.env.DB_USER);
        const password = encodeURIComponent(process.env.DB_PASSWORD);
        const host = process.env.DB_HOST;
        const dbName = getDbName();
        return `mongodb+srv://${user}:${password}@${host}/${dbName}?retryWrites=true&w=majority`;
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error("MONGODB_URI is required in production");
    }

    return `mongodb://127.0.0.1:27017/${getDbName()}`;
}

function getJwtSecret() {
    if (process.env.JWT_SECRET) {
        return process.env.JWT_SECRET;
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error("JWT_SECRET is required in production");
    }

    return "dev-only-jwt-secret-change-me";
}

function getJwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || "2h";
}

module.exports = {
    getDbName,
    getUrl,
    getJwtSecret,
    getJwtExpiresIn,
};
