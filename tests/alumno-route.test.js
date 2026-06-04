"use strict";

const express = require("express");
const request = require("supertest");
const Alumno = require("../models/Alumno");
const alumnoRouter = require("../routes/alumno-route");
const { errorHandler } = require("../middlewares/http");

jest.mock("../models/Alumno", () => ({
    saveAlumno: jest.fn(),
    getAlumnobyEmail: jest.fn(),
    updateAlumno: jest.fn(),
}));

jest.mock("../middlewares/validaciones.js", () => ({
    validarToken: (req, res, next) => {
        req.correo = req.get("x-test-email") || "user@example.com";
        next();
    },
}));

jest.mock("../middlewares/validacionesAlumnos.js", () => ({
    validarAtributosUsuario: (req, res, next) => next(),
    confirmarPassword: (req, res, next) => next(),
    encriptarPassword: (req, res, next) => next(),
}));

function createApp() {
    const app = express();
    app.use(express.json());
    app.use("/api/alumnos", alumnoRouter);
    app.use(errorHandler);
    return app;
}

describe("alumno route safe responses", () => {
    const app = createApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("does not return password hashes after registration", async () => {
        Alumno.saveAlumno.mockResolvedValue({
            nombre: "Test",
            apellido: "User",
            correo: "user@example.com",
            matricula: "12345",
            password: "hashed-password",
        });

        const response = await request(app).post("/api/alumnos").send({
            nombre: "Test",
            apellido: "User",
            correo: "user@example.com",
            matricula: "12345",
            password: "secret",
            confPassword: "secret",
        });

        expect(response.status).toBe(201);
        expect(response.body.password).toBeUndefined();
        expect(response.body.correo).toBe("user@example.com");
    });

    test("does not return password hashes after updates", async () => {
        Alumno.updateAlumno.mockResolvedValue({
            nombre: "Updated",
            apellido: "User",
            correo: "user@example.com",
            matricula: "12345",
            password: "hashed-password",
        });

        const response = await request(app)
            .put("/api/alumnos")
            .set("x-test-email", "user@example.com")
            .send({ nombre: "Updated" });

        expect(response.status).toBe(200);
        expect(response.body.password).toBeUndefined();
        expect(response.body.nombre).toBe("Updated");
    });
});
