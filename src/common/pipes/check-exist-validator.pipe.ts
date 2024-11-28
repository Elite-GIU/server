import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Types } from 'mongoose'; 

@Injectable()
export class CheckExistValidatorPipe implements PipeTransform {
    constructor(@InjectConnection() private connection: Connection) {}

    async transform(value: { id: string, modelName: string }, metadata: ArgumentMetadata) {
        if (!value.modelName || !this.connection.models[value.modelName]) {
            throw new BadRequestException(`Model ${value.modelName} not found`);
        }

        if (!Types.ObjectId.isValid(value.id)) {
            throw new BadRequestException(`Not a valid ObjectId`);
        }

        const model: Model<any> = this.connection.models[value.modelName];
        const exists = await model.findById(value.id).exec();
        if (!exists) {
            throw new BadRequestException(`Resource with id ${value.id} not found in model ${value.modelName}`);
        }        
        return value;
    }
}
