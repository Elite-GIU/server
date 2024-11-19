import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,  
  ) {}

  // Method for registration (creating new user)
  async register(email: string, password: string, name: string, role: string) {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    const user = await this.userService.create({ email, password: hashedPassword, name, role });
    return this.generateJwt(user);
  }

  // Method for login (returning JWT)
  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    return this.generateJwt(user);
  }

  // Method to generate JWT
  private generateJwt(user: any) {
    const payload = { userId: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
