import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
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
