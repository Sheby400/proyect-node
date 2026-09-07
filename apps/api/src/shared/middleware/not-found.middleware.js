export function notFoundMiddleware (req, res){
    return res.status(404).json({
        success: false,
        error: {
            code:'ROUTE_NOT_FOUND',
            message: `Route ${req.method} ${req.originalUrl} not found`
        },
        meta: {
            requestId: req.id
        }
    })
}