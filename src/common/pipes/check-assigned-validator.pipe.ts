import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';

@Injectable()
export class CheckAssignedValidatorPipe implements PipeTransform {
    constructor(@InjectConnection() private connection: Connection) {}

    async transform(value: any, metadata: ArgumentMetadata) {
        let { modelName, firstAttrName, secondAttrName, firstValue, secondValue, userId } = value;

        if (firstValue === 'userId') {
            firstValue = userId;
        }

        // Validate ObjectId formats
        if (!Types.ObjectId.isValid(firstValue) || !Types.ObjectId.isValid(secondValue)) {
            throw new BadRequestException(`Invalid input provided.`);
        }

        const model: Model<any> = this.connection.models[modelName];
        if (!model) {
            throw new BadRequestException(`Validation error occurred.`);
        }

        // Check if the resource exists
        const exists = await model.findOne({
            [firstAttrName]: new Types.ObjectId(firstValue),
            [secondAttrName]: new Types.ObjectId(secondValue),
        }).exec();

        if (!exists) {
            throw new BadRequestException(`Requested resource is not accessible.`);
        }

        return {
            [firstAttrName]: firstValue,
            [secondAttrName]: secondValue,
        } 
    }
}
