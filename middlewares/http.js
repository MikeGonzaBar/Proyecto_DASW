"use strict";

function asyncHandler(handler) {
    return function wrappedHandler(req, res, next) {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

function isObjectId(value) {
    return typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);
}

function validateObjectIdParam(name) {
    return function validateParam(req, res, next) {
        if (!isObjectId(req.params[name])) {
            res.status(400).send(`ID inválido: ${name}`);
            return;
        }
        next();
    };
}

function validateObjectIdHeader(name) {
    return function validateHeader(req, res, next) {
        const value = req.get(name);
        if (!isObjectId(value)) {
            res.status(400).send(`ID inválido: ${name}`);
            return;
        }
        next();
    };
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        next(err);
        return;
    }
    console.error(err);
    res.status(err.status || 500).send({
        error: err.message || "Error interno del servidor",
    });
}

module.exports = {
    asyncHandler,
    isObjectId,
    validateObjectIdHeader,
    validateObjectIdParam,
    errorHandler,
};
