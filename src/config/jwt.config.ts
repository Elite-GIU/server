import { ConfigService } from '@nestjs/config';

export const JwtConfig = (configService: ConfigService) => ({
  secret: configService.get<string>('JWT_SECRET'),
  signOptions: { expiresIn: '1h' },
});




