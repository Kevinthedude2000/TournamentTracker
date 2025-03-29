// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: DeepMocked<UsersService>;
  let mockJwtService: DeepMocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: createMock<UsersService>(),
        },
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockUsersService = module.get<DeepMocked<UsersService>>(UsersService);
    mockJwtService = module.get<DeepMocked<JwtService>>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return an access token when credentials are valid', async () => {
      // Arrange
      const emailAddress = 'test@example.com';
      const password = 'correctPassword';
      const userId = 1;

      const mockUser = new User();
      mockUser.userId = userId;
      mockUser.emailAddress = emailAddress;
      mockUser.password = password; // In a real app, this would be hashed

      const expectedToken = 'jwt-token-here';
      const expectedPayload = { sub: userId, username: emailAddress };

      mockUsersService.getBy.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await service.signIn(emailAddress, password);

      // Assert
      expect(result).toEqual({ access_token: expectedToken });
      expect(mockUsersService.getBy).toHaveBeenCalledWith(emailAddress);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(expectedPayload);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      const emailAddress = 'nonexistent@example.com';
      const password = 'anyPassword';

      mockUsersService.getBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signIn(emailAddress, password)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUsersService.getBy).toHaveBeenCalledWith(emailAddress);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const emailAddress = 'test@example.com';
      const correctPassword = 'correctPassword';
      const wrongPassword = 'wrongPassword';

      const mockUser = new User();
      mockUser.userId = 1;
      mockUser.emailAddress = emailAddress;
      mockUser.password = correctPassword;

      mockUsersService.getBy.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.signIn(emailAddress, wrongPassword)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUsersService.getBy).toHaveBeenCalledWith(emailAddress);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should handle authentication with empty password', async () => {
      // Arrange
      const emailAddress = 'test@example.com';
      const emptyPassword = '';

      const mockUser = new User();
      mockUser.userId = 1;
      mockUser.emailAddress = emailAddress;
      mockUser.password = 'actualPassword';

      mockUsersService.getBy.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.signIn(emailAddress, emptyPassword)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUsersService.getBy).toHaveBeenCalledWith(emailAddress);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should handle case sensitivity in password comparison', async () => {
      // Arrange
      const emailAddress = 'test@example.com';
      const correctPassword = 'Password123';
      const wrongCasePassword = 'password123';

      const mockUser = new User();
      mockUser.userId = 1;
      mockUser.emailAddress = emailAddress;
      mockUser.password = correctPassword;

      mockUsersService.getBy.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        service.signIn(emailAddress, wrongCasePassword),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUsersService.getBy).toHaveBeenCalledWith(emailAddress);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should propagate errors from UsersService', async () => {
      // Arrange
      const emailAddress = 'test@example.com';
      const password = 'password';
      const errorMessage = 'Database connection error';

      mockUsersService.getBy.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.signIn(emailAddress, password)).rejects.toThrow(
        errorMessage,
      );

      expect(mockUsersService.getBy).toHaveBeenCalledWith(emailAddress);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should propagate errors from JwtService', async () => {
      // Arrange
      const emailAddress = 'test@example.com';
      const password = 'correctPassword';
      const errorMessage = 'JWT signing error';

      const mockUser = new User();
      mockUser.userId = 1;
      mockUser.emailAddress = emailAddress;
      mockUser.password = password;

      mockUsersService.getBy.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.signIn(emailAddress, password)).rejects.toThrow(
        errorMessage,
      );

      expect(mockUsersService.getBy).toHaveBeenCalledWith(emailAddress);
      expect(mockJwtService.signAsync).toHaveBeenCalled();
    });
  });
});
