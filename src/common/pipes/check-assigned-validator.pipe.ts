import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { GetUser } from '../decorators/getUser.decorator';
import { first } from 'rxjs';
@Injectable()
export class CheckAssignedValidatorPipe implements PipeTransform {
    constructor(@InjectConnection() private connection: Connection) {}

    async transform(value: any, metadata: ArgumentMetadata) {
        
        let { modelName, firstAttrName, secondAttrName, firstValue, secondValue, userId } = value;
        
        if (firstValue === 'userId') {
            firstValue = userId;
        }

        if (!Types.ObjectId.isValid(firstValue) || !Types.ObjectId.isValid(secondValue)) {
            throw new BadRequestException(`Invalid ID format for ${firstAttrName} = ${firstValue} or ${secondAttrName} = ${secondValue}`);
        }
        
        console.log(value);
        const model: Model<any> = this.connection.models[modelName];
        if (!model) {
            throw new BadRequestException(`Model ${modelName} not found`);
        }

        const exists = await model.findOne({
            [firstAttrName]: new Types.ObjectId(firstValue),
            [secondAttrName]: new Types.ObjectId(secondValue),
        }).exec();

        if (!exists) {
            throw new BadRequestException(`Resource not found with ${firstAttrName} = ${firstValue} and ${secondAttrName} = ${secondValue} in model ${modelName}`);
        }

        return value.firstValue;
    }
}
