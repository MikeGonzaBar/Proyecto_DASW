"use strict";

const express = require("express");
const request = require("supertest");
const Calendario = require("../models/Calendario");
const calendarioRouter = require("../routes/calendario-route");
const { errorHandler } = require("../middlewares/http");

jest.mock("../models/Calendario", () => ({
    getCalendarios: jest.fn(),
    getCalendarioById: jest.fn(),
    saveCalendario: jest.fn(),
    deleteCalendarioById: jest.fn(),
    updateCalendario: jest.fn(),
}));

jest.mock("../middlewares/validaciones.js", () => {
    const pass = (req, res, next) => next();
    return {
        validarToken: (req, res, next) => {
            req.correo = req.get("x-test-email") || "owner@example.com";
            next();
        },
        obtenerMaterias: pass,
        validarCamposCalendario: pass,
        ajustarEdicionCalendario: pass,
    };
});

function createApp() {
    const app = express();
    app.use(express.json());
    app.use("/api/calendarios", calendarioRouter);
    app.use(errorHandler);
    return app;
}

describe("calendario detail route", () => {
    const app = createApp();
    const validId = "64b64c2f8d5b4f1f1f1f1f1f";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("returns the calendar when the requester owns it", async () => {
        Calendario.getCalendarioById.mockResolvedValue({
            _id: validId,
            alumno: "owner@example.com",
            nombre: "Mi horario",
        });

        const response = await request(app)
            .get(`/api/calendarios/${validId}`)
            .set("x-test-email", "owner@example.com");

        expect(response.status).toBe(200);
        expect(response.body.nombre).toBe("Mi horario");
    });

    test("forbids access to another user's calendar", async () => {
        Calendario.getCalendarioById.mockResolvedValue({
            _id: validId,
            alumno: "owner@example.com",
            nombre: "Mi horario",
        });

        const response = await request(app)
            .get(`/api/calendarios/${validId}`)
            .set("x-test-email", "other@example.com");

        expect(response.status).toBe(403);
        expect(response.text).toBe("No tienes autorización");
    });

    test("returns 404 when the calendar does not exist", async () => {
        Calendario.getCalendarioById.mockResolvedValue(null);

        const response = await request(app)
            .get(`/api/calendarios/${validId}`)
            .set("x-test-email", "owner@example.com");

        expect(response.status).toBe(404);
        expect(response.text).toBe("Calendario no encontrado");
    });

    test("rejects invalid ObjectIds before querying", async () => {
        const response = await request(app)
            .get("/api/calendarios/not-an-object-id")
            .set("x-test-email", "owner@example.com");

        expect(response.status).toBe(400);
        expect(Calendario.getCalendarioById).not.toHaveBeenCalled();
    });
});
