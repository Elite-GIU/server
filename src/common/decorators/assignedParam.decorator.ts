import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AssignedParam = createParamDecorator(
  (data: { modelName: string, firstAttrName: string, secondAttrName: string, firstKey: string, secondKey: string }, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const body = request.body;
    const params = request.params;
    const user = request.user;  
    const res = { 
      ...params, 
      ...body, 
      ...data,
      ...user
    }
    const firstValue = res[data.firstKey] || res[data.firstKey];
    const secondValue = res[data.secondKey];
    const modelName = data.modelName;
    return {
      ...body, 
      modelName: modelName,
      firstAttrName: data.firstAttrName,
      secondAttrName: data.secondAttrName,
      firstValue: firstValue,
      secondValue: secondValue,
      userId: request.user.userId 
    };
  }
);
