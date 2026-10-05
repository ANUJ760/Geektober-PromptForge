export default function errorHandler(err, req, res, next) {
    console.error('Unhandled Application Error:', err);

    const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}
