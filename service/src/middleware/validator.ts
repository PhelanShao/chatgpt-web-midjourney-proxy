import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 执行所有验证
    await Promise.all(validations.map(validation => validation.run(req)));

    // 检查验证结果
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // 如果有错误，返回400错误
    return res.status(400).json({
      status: 'Fail',
      message: '验证失败',
      data: errors.array()
    });
  };
};