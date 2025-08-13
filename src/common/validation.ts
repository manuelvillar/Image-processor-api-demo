import { z, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Base schemas
export const TaskIdSchema = z.string().min(1, 'Task ID is required');

export const PriceSchema = z
  .number()
  .min(5, 'Price must be at least 5')
  .max(50, 'Price must be at most 50');

export const StatusSchema = z.enum(['pending', 'completed', 'failed']);

export const ResolutionSchema = z.enum(['1024', '800']);

export const Md5Schema = z.string().length(32, 'MD5 must be 32 characters');

export const PathSchema = z.string().min(1, 'Path is required');

// Request schemas
export const CreateTaskRequestSchema = z.object({
  imageUrl: z.url('Invalid URL format').optional(),
  imageFile: z.string().min(1, 'File data is required').optional(),
}).refine(
  (data) => {
    // Check if at least one is provided
    if (!data.imageUrl && !data.imageFile) {
      return false;
    }
    // Check that not both are provided
    if (data.imageUrl && data.imageFile) {
      return false;
    }
    return true;
  },
  {
    message: 'Either imageUrl or imageFile must be provided, but not both',
    path: ['imageUrl'], // This will show the error on the imageUrl field
  }
).transform((data) => ({
  imageUrl: data.imageUrl || undefined,
  imageFile: data.imageFile || undefined,
}));

export const GetTaskResponseSchema = z.object({
  taskId: TaskIdSchema,
  status: StatusSchema,
  price: PriceSchema,
  originalPath: PathSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
  images: z.array(z.object({
    resolution: ResolutionSchema,
    path: PathSchema,
    md5: Md5Schema,
    createdAt: z.date(),
  })).optional(),
});

export const ImageSchema = z.object({
  resolution: ResolutionSchema,
  path: PathSchema,
  md5: Md5Schema,
  createdAt: z.date(),
});

// Validation middleware
export function validate<T extends z.ZodTypeAny>(
  schema: T
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: (error as ZodError).issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }
      return next(error);
    }
  };
}


