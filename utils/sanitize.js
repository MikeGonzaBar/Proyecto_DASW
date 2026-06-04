"use strict";

function toPlainObject(doc) {
    if (!doc) {
        return doc;
    }
    if (typeof doc.toObject === "function") {
        return doc.toObject();
    }
    return { ...doc };
}

function sanitizeAlumno(doc) {
    const alumno = toPlainObject(doc);
    if (!alumno) {
        return alumno;
    }
    delete alumno.password;
    delete alumno.__v;
    return alumno;
}

module.exports = {
    sanitizeAlumno,
};
