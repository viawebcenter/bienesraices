import bcrypt from "bcrypt"

const usuarios = [
    {
        nombre: "Francisco",
        email: "francisco@correo.com",
        confirmado: 1,
        password: bcrypt.hashSync("password", 10)
    }
]

export default usuarios