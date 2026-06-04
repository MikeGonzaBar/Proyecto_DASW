"use strict";

jest.mock("../models/Profesor", () => ({
    getProfesores: jest.fn().mockResolvedValue([{ _id: "prof1" }]),
}));

jest.mock("../models/Alumno.js", () => ({}));
jest.mock("../models/Carrera.js", () => ({}));
jest.mock("../models/Clase.js", () => ({}));
jest.mock("../models/Calendario", () => ({}));

const Val = require("../middlewares/validaciones.js");

async function runValidation(sesion) {
    const req = {
        body: {
            sesion,
            profesor: "prof1",
            materia: "MAT101",
        },
    };
    const res = {
        statusCode: 200,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        send(body) {
            this.body = body;
            return this;
        },
    };
    let nextCalled = false;

    await Val.validarCamposClases(req, res, () => {
        nextCalled = true;
    });

    return { req, res, nextCalled };
}

describe("validarCamposClases", () => {
    test("rejects classes that start after they end", async () => {
        const result = await runValidation([
            { dia: "LUN", horaInicio: 10, horaFinal: 9 },
        ]);

        expect(result.res.statusCode).toBe(400);
        expect(result.res.body).toContain("empezar despues");
        expect(result.nextCalled).toBe(false);
    });

    test("accepts numeric string hours and normalizes them", async () => {
        const result = await runValidation([
            { dia: "LUN", horaInicio: "9", horaFinal: "10" },
        ]);

        expect(result.res.statusCode).toBe(200);
        expect(result.nextCalled).toBe(true);
        expect(result.req.body.sesion[0].horaInicio).toBe(9);
        expect(result.req.body.sesion[0].horaFinal).toBe(10);
    });
});
