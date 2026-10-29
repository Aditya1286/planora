"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.errors.map((err) => ({
                    path: err.path.join('.').replace(/^(body|query|params)\./, ''),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    message: 'Validation failed for request parameters or payload.',
                    errors: formattedErrors,
                });
                return;
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
