import nodemailer from "nodemailer"

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos

    // Enviar el email
    await transport.sendMail({
        from: "Bienes Raices",
        to: email,
        subject: "Confirma tu cuenta en Bienes Raíces",
        text: "Confirma tu cuenta en Bienes Raíces",
        html: `
            <p>Hola ${nombre}, compureba tu cuenta en Bienes Raíces</p>

            <p>Tu cuenta ya está lista, sólo debes confirmarla en el siguiente enlace:  <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3001}/auth/confirmar/${token}">Confirmar Cuenta"</a>
            </p>

            <p>Si tú no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
    })
}

const emailOlvidePassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos

    // Enviar el email
    await transport.sendMail({
        from: "Bienes Raices",
        to: email,
        subject: "Restablece tu Password en Bienes Raíces",
        text: "Restablece tu Password en Bienes Raíces",
        html: `
            <p>Hola ${nombre}, has solicitado reestablecer tu Password en Bienes Raíces</p>

            <p>Sigue el siguiente enlace para generar un password nuevo:  <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3001}/auth/olvide-password/${token}">Restablecer Password</a>
            </p>

            <p>Si tú no solicitaste el cambio de password, puedes ignorar este mensaje</p>
        `
    })
}

export {
    emailRegistro,
    emailOlvidePassword
}