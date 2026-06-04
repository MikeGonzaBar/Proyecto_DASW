"use strict";
const router = require("express").Router();
const Val = require("../middlewares/validaciones.js");
const Materia = require("../models/Materia");
const Carrera = require("../models/Carrera");
const Profesor = require("../models/Profesor");
const Clase = require("../models/Clase");
const { asyncHandler, validateObjectIdParam } = require("../middlewares/http");

router.use(Val.validarToken, Val.validarAdmin);

router.post("/materias", Val.validarCamposMaterias, asyncHandler(async (req, res) => {
	let { nombre, descripcion, creditos } = req.body;
	let doc = await Materia.saveMateria({ nombre, descripcion, creditos });
	if (doc) {
		res.status(201).send(doc);
		return;
	}
	res.status(400).send("No se pudo registrar la materia");
}));

router.post("/carreras", Val.validarCamposCarrera, asyncHandler(async (req, res) => {
	let { nombre, descripcion, seriacion } = req.body;
	let doc = await Carrera.saveCarrera({ nombre, descripcion, seriacion });
	if (doc) {
		res.status(201).send(doc);
		return;
	}
	res.status(400).send("No se pudo registrar la carrera");
}));

router.post("/profesores", Val.validarCamposProfesor, asyncHandler(async (req, res) => {
	let { nombre, apellido } = req.body;
	let doc = await Profesor.saveProfesor({ nombre, apellido });
	if (doc) {
		res.status(201).send(doc);
		return;
	}
	res.status(400).send("No se pudo registrar el profesor");
}));

router.get("/profesores", asyncHandler(async (req,res)=>{
	let doc = await Profesor.getProfesores({});
	if (doc) {
		res.status(200).send(doc);
		return;
	}
	res.status(400).send("No se pudo obtener los profesores");
}))

router.get("/profesores/:id", validateObjectIdParam("id"), asyncHandler(async (req,res)=>{
	let id = req.params.id;
	let doc = await Profesor.getProfesorById(id);
	if (doc) {
		res.status(200).send(doc);
		return;
	}
	res.status(400).send("No se pudo encontrar el profesor");
}))

router.post("/clases", asyncHandler(Val.validarCamposClases), asyncHandler(async (req, res) => {
	let { sesion, profesor, materia } = req.body;
	let doc = await Clase.saveClase({ sesion, profesor, materia });
	if (doc) {
		res.status(201).send(doc);
		return;
	}
	res.status(400).send("No se pudo registrar la clase");
}));

module.exports = router;
