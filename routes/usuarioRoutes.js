import express from "express"
import { formularioLogin, autenticar, cerrarSesion, formularioRegistro, formularioOlvidePassword, registrar, confirmar, resetPassword, comprobarToken, nuevoPassword } from "../controllers/usuarioController.js"

const router = express.Router()

// Login
router.get("/login", formularioLogin)
router.post("/login", autenticar)

// Cerrar sesión
router.post("/cerrar-sesion", cerrarSesion)

// Registrar Usuario

router.get("/registro", formularioRegistro)
router.post("/registro", registrar)

router.get("/confirmar/:token", confirmar)

router.get("/olvide-password", formularioOlvidePassword)

router.post("/olvide-password", resetPassword)

// Almacena el nuevo password
router.get("/olvide-password/:token", comprobarToken);
router.post("/olvide-password/:token", nuevoPassword);


export default router
