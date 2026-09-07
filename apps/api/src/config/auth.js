export const authConfig = Object.freeze({
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCCES_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN
})

if (!authConfig.accessSecret || !authConfig.refreshSecret){
    throw new Error('JWT es requerido')
}