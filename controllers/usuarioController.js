import { check, validationResult } from "express-validator"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import Usuario from "../models/Usuario.js"
import { generarJWT, generarId } from "../helpers/tokens.js"
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js"

const formularioLogin = (req, res) => {
    res.render("auth/login", {
        pagina: "Iniciar Sesión",
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {
    // Validación
    await check("email").isEmail().withMessage("El Email es Obligatorio").run(req)
    await check("password").notEmpty().withMessage("El Password es Obligatorio").run(req)

    let resultado = validationResult(req);

    // Verificar que el resultado esté vacío
    if (!resultado.isEmpty()) {
        // Errores
        return res.render("auth/login", {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const { email, password } = req.body

    // Comprobar si el Usuario existe
    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render("auth/login", {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "El Usuario No Existe" }]
        })
    }

    // Conprobar si el Usuario está confirmado
    if (!usuario.confirmado) {
        return res.render("auth/login", {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "Tu Cuenta No Ha sido Confirmada" }]
        })
    }

    // Revisar el Password
    if (!usuario.verificarPassword(password)) {
        return res.render("auth/login", {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "El Password es Incorrecto" }]
        })
    }

    // Autenticar al usuario
    const token = generarJWT({ id: usuario.id, nombre: usuario.nombre })

    // Almacenar en un cookie
    return res.cookie("_token", token, {
        httpOnly: true
    }).redirect("/mis-propiedades")

}

// Cerrar Sesión
const cerrarSesion = (req, res) => {
    //console.log("cerrando...")

    return res.clearCookie("_token").status(200).redirect("/auth/login")
}

const formularioRegistro = (req, res) => {
    res.render("auth/registro", {
        pagina: "Crear Cuenta",
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {
    // Validación de campos
    await check("nombre").notEmpty().withMessage("El campo nombre no puede ir vacío").run(req)
    await check("email").isEmail().withMessage("No es un email válido").run(req)
    await check("password").isLength({ min: 3 }).withMessage("Tiene menos de 6 caracteres").run(req)
    //await check("repetir_password").equals("password").withMessage("Los passwords no son los mismos").run(req)

    let resultado = validationResult(req)

    //return res.json(resultado.array())

    // Verificar que el resultado esté vacío
    if (!resultado.isEmpty()) {
        // Hay errores
        return res.render("auth/registro", {
            pagina: "Crear Cuenta",
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // Extraer los datos
    const { nombre, email, password } = req.body

    // Verificar que el usuario no esté duplicado
    const existeUsuario = await Usuario.findOne({ where: { email } })
    if (existeUsuario) {
        return res.render("auth/registro", {
            pagina: "Crear Cuenta",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "El usuario ya está registrado" }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // Almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    // Envía email de confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    //  Mostrar mensaje de confirmación
    res.render("templates/mensaje", {
        pagina: "Cuenta Creada Correctamente",
        mensaje: "Hemos enviado un Email de Confirmación. Presiona en el enlace"
    })

    //console.log(existeUsuario)
    //return;

    //const usuario = await Usuario.create(req.body)
    //res.json(usuario)
}

// Función que comprueba una cuenta
const confirmar = async (req, res) => {
    const { token } = req.params;

    // Verificar si el token es válido
    const usuario = await Usuario.findOne({ where: { token } })

    if (!usuario) {
        return res.render("auth/confirmar-cuenta", {
            pagina: "Error al confirmar tu cuenta",
            mensaje: "Hubo un error al confirmar tu cuenta. Intenta de nuevo",
            error: true
        })
    }

    // Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true
    await usuario.save();

    return res.render("auth/confirmar-cuenta", {
        pagina: "Cuenta Confirmada",
        mensaje: "La Cuenta se Confirmó Correctamente"
    })
}


const formularioOlvidePassword = (req, res) => {
    res.render("auth/olvide-password", {
        pagina: "Recuperar Password",
        csrfToken: req.csrfToken()
    })
}

const resetPassword = async (req, res) => {
    // Validación
    await check("email").isEmail().withMessage("Eso no parece un email").run(req)

    let resultado = validationResult(req)

    // Verificar que el resultado esté vacío
    if (!resultado.isEmpty()) {
        // Errores
        return res.render("auth/olvide-password", {
            pagina: "Recupera tu acceso a Bienes Raíces",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    // Buscar el usuario

    const { email } = req.body

    const usuario = await Usuario.findOne({ where: { email } })

    if (!usuario) {
        return res.render("auth/olvide-password", {
            pagina: "Recupera tu acceso a Bienes Raices",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "Este email no pertenece a ningún Usuario registrado" }]
        })
    }

    // Generar un token y enviar el email
    usuario.token = generarId();
    await usuario.save();

    // Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //  Mostrar mensaje de confirmación
    res.render("templates/mensaje", {
        pagina: "Restablece tu Password",
        mensaje: "Hemos enviado un Email con las instrucciones"
    })

}

const comprobarToken = async (req, res) => {

    const { token } = req.params;

    const usuario = await Usuario.findOne({ where: { token } })

    if (!usuario) {
        return res.render("auth/confirmar-cuenta", {
            pagina: "Restablece tu Password",
            mensaje: "Hubo un error al validad tu información. Intenta de nuevo",
            error: true
        })
    }

    // Mostrar el formulario para modificar el password
    res.render("auth/reset-password", {
        pagina: "Restablece tu Password",
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req, res) => {
    // Validar el password
    await check("password").isLength({ min: 3 }).withMessage("El password debe ser al menos de 6 caracteres").run(req)

    let resultado = validationResult(req)

    // Verificar que el resultado esté vacío
    if (!resultado.isEmpty()) {
        // Errores
        return res.render("auth/reset-password", {
            pagina: "Restablce tu Password",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const { token } = req.params;
    const { password } = req.body;

    // Identificar quien hace el cambio
    const usuario = await Usuario.findOne({ where: { token } })

    // Hashear el nuevo password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();

    res.render("auth/confirmar-cuenta", {
        pagina: "Password Restablecido",
        mensaje: "El Password se guardó correctamente"
    })

}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword
}