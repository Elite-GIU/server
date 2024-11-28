import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ExistParam = createParamDecorator(
  (data: { idKey: string, modelName: string }, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const id = request.params[data.idKey];
    const modelName = data.modelName;
    return { id, modelName };
  },
);
