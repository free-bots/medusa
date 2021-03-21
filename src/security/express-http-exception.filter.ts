import { Request, Response } from 'express';
import { HttpException } from '@nestjs/common';

export function catchHttpException(req: Request, res: Response, promise: Promise<any>): void {
  promise.catch((reason) => {
    const status = reason instanceof HttpException ? reason?.getStatus() || 500 : 500;

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  });
}
