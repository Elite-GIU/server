import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from '../../database/schemas/user.schema';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { MyProfileDto } from './dto/MyProfileDto';
@Injectable()
export class UserService {
  
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // Method to create a new user
  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save(); 
  }

  // Method to find a user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Method to find a user by their email verification token
  async findOneByToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ emailVerificationToken: token }).exec();
  }

  // Method to update a user by ID
  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<MyProfileDto | null> {
    const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true }).exec();
    if (!user) {
      return null;
    }
    enum UserRole {
      ADMIN = 'admin',
      INSTRUCTOR = 'instructor',
      STUDENT = 'student',
    }
    const myProfile: MyProfileDto = {
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      preferences: user.preferences,
    };
    return myProfile;
  }

  // Method to get user profile by ID
  async getMyProfile(userId: string): Promise<MyProfileDto | null> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      return null;
    }
    enum UserRole {
      ADMIN = 'admin',
      INSTRUCTOR = 'instructor',
      STUDENT = 'student',
    }
    const myProfile: MyProfileDto = {
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      preferences: user.preferences,
    };
    return myProfile;
  }


  // Update a user's details (generic)
  async update(user: User): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(user._id, user, { new: true }).exec();
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  }

  async findById(userId: string): Promise<User | null> {
      const userIdObj = new mongoose.Types.ObjectId(userId);
      return this.userModel.findById(userIdObj).exec();
  }
}
