import jwt from "jsonwebtoken"
import { Usuario } from "../models/index.js"

const protegerRuta = async (req, res, next) => {
    // Verificar ruta
    const { _token } = req.cookies
    if (!_token) {
        return res.redirect("/auth/login")
    }
    // Comprobar Token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const usuario = await Usuario.scope("eliminarPassword").findByPk(decoded.id)
        // Almacenar el Usuario en el request
        if (usuario) {
            req.usuario = usuario
        } else {
            return res.redirect("/auth/login")
        }
        return next();

    } catch (error) {
        return res.clearCookie("_token").redirect("/auth/login")
    }


}

export default protegerRuta