"use strict";
const router = require("express").Router();
const Alumno = require("../models/Alumno");
const Val = require("../middlewares/validaciones.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../middlewares/http");

router.post("/", Val.validarCamposLogin, asyncHandler(async (req, res) => {
	let { correo } = req.body;
	let usuario = await Alumno.getAlumnobyEmail(correo);
	if (!usuario) {
		res.status(404).send("El usuario o contraseña no coinciden");
		return;
	}
	const passwordOk = await bcrypt.compare(req.body.password, usuario.password);
	if (!passwordOk) {
		res.status(404).send("El usuario o contraseña no coinciden");
		return;
	}
	let token = jwt.sign({ correo: correo }, Val.sign, { expiresIn: Val.jwtExpiresIn });
	res.status(200).send({ token: token });
}));

module.exports = router;
