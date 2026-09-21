import { AppError } from "../../shared/errors/app-error.js";
import * as userRepository from './user.repository.js'
export async function me (req, res){
    const user = await userRepository.findById(req.auth.userId)
    if(!user) {
        throw new AppError ({
            statusCode: 404,
            code : 'USER_NOT_FOUND',
            message: 'Usuario no encontrado'
            })
    }
    return res.status(200).json ({
        success: true,
        data: user,
        meta: {
            requestId: req.id
        }
    })
}
