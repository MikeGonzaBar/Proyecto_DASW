"use strict";

const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Alumno = require("../models/Alumno");
const loginRouter = require("../routes/login-route");
const { errorHandler } = require("../middlewares/http");

jest.mock("../models/Alumno", () => ({
    getAlumnobyEmail: jest.fn(),
}));

jest.mock("../middlewares/validaciones.js", () => ({
    sign: "test-secret",
    jwtExpiresIn: "1h",
    validarCamposLogin: (req, res, next) => {
        const { correo, password } = req.body;
        let error = "Hace falta: ";
        if (!password) error += "contraseña ";
        if (!correo) error += "correo ";
        if (!correo || !password) {
            res.status(400).send(error);
            return;
        }
        next();
    },
}));

function createApp() {
    const app = express();
    app.use(express.json());
    app.use("/api/login", loginRouter);
    app.use(errorHandler);
    return app;
}

describe("login route", () => {
    const app = createApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("validates required fields", async () => {
        const response = await request(app).post("/api/login").send({});

        expect(response.status).toBe(400);
        expect(response.text).toContain("contraseña");
        expect(response.text).toContain("correo");
    });

    test("returns an expiring JWT for valid credentials", async () => {
        const password = "abc12345";
        Alumno.getAlumnobyEmail.mockResolvedValue({
            correo: "user@example.com",
            password: bcrypt.hashSync(password, 8),
        });

        const response = await request(app).post("/api/login").send({
            correo: "user@example.com",
            password,
        });

        expect(response.status).toBe(200);
        const decoded = jwt.verify(response.body.token, "test-secret");
        expect(decoded.correo).toBe("user@example.com");
        expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    test("rejects invalid credentials", async () => {
        Alumno.getAlumnobyEmail.mockResolvedValue({
            correo: "user@example.com",
            password: bcrypt.hashSync("right-password", 8),
        });

        const response = await request(app).post("/api/login").send({
            correo: "user@example.com",
            password: "wrong-password",
        });

        expect(response.status).toBe(404);
        expect(response.text).toBe("El usuario o contraseña no coinciden");
    });
});
