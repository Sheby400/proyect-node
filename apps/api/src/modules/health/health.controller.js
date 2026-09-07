import { env } from "../../config/env.js";

export function getHealth(req, res){
    return res.status(200).json({
        success: true,
        data: {
            service: 'eccomerce-api',
            status: 'ok',
            environment: env.NODE_ENV,
            uptime: Number(process.uptime().toFixed(2)),
            timestamp: new Date().toISOString()
        },
        meta: {
            requestID: req.id
        }
    })
}