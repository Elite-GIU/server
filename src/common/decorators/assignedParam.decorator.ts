import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AssignedParam = createParamDecorator(
  (data: { modelName: string, firstAttrName: string, secondAttrName: string, firstKey: string, secondKey: string }, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const firstValue = request.params[data.firstKey] || request.user[data.firstKey];
    const secondValue = request.params[data.secondKey];
    const modelName = data.modelName;

    return {
      modelName: modelName,
      firstAttrName: data.firstAttrName,
      secondAttrName: data.secondAttrName,
      firstValue: firstValue,
      secondValue: secondValue,
      userId: request.user.userId  // Assumed that JWT strategy populates `request.user` with `userId`
    };
  }
);
