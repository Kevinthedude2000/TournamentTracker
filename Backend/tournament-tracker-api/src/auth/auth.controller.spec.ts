import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthGuard } from '@nestjs/passport';
import { CanActivate, UnauthorizedException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in-dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthGuard: CanActivate;
  let mockAuthService: DeepMocked<AuthService>;
  let mockJwtService: DeepMocked<JwtService>;

  beforeEach(async () => {
    mockAuthGuard = { canActivate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AuthService, useValue: createMock<AuthService>() },
        { provide: JwtService, useValue: createMock<JwtService>() },
      ],
      controllers: [AuthController],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    mockAuthService = module.get<DeepMocked<AuthService>>(AuthService);
    mockJwtService = module.get<DeepMocked<JwtService>>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should return a JWT token when credentials are valid', async () => {
      // Arrange
      const signInDto: SignInDto = {
        username: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        access_token: 'jwt-token-here',
      };

      mockAuthService.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signIn(signInDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        signInDto.username,
        signInDto.password,
      );
      expect(mockAuthService.signIn).toHaveBeenCalledTimes(1);
    });

    it('should pass the username and password directly to the auth service', async () => {
      // Arrange
      const signInDto: SignInDto = {
        username: 'john.doe@example.com',
        password: 'securePwd456',
      };

      mockAuthService.signIn.mockResolvedValue({ access_token: 'some-token' });

      // Act
      await controller.signIn(signInDto);

      // Assert
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        'john.doe@example.com',
        'securePwd456',
      );
    });

    it('should handle authentication failures from the service', async () => {
      // Arrange
      const signInDto: SignInDto = {
        username: 'invalid@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException());

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        signInDto.username,
        signInDto.password,
      );
    });

    it('should handle empty username in the DTO', async () => {
      // Arrange
      const signInDto: SignInDto = {
        username: '',
        password: 'somepassword',
      };

      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException());

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.signIn).toHaveBeenCalledWith('', 'somepassword');
    });

    it('should handle empty password in the DTO', async () => {
      // Arrange
      const signInDto: SignInDto = {
        username: 'user@example.com',
        password: '',
      };

      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException());

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        'user@example.com',
        '',
      );
    });

    it('should propagate non-UnauthorizedException errors from the service', async () => {
      // Arrange
      const signInDto: SignInDto = {
        username: 'test@example.com',
        password: 'password123',
      };

      const customError = new Error('Custom service error');
      mockAuthService.signIn.mockRejectedValue(customError);

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(
        'Custom service error',
      );
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        signInDto.username,
        signInDto.password,
      );
    });

    it('should correctly handle complex email addresses', async () => {
      // Arrange
      const signInDto: SignInDto = {
        username: 'complex+email.with-special_chars@example-domain.co.uk',
        password: 'password123',
      };

      mockAuthService.signIn.mockResolvedValue({ access_token: 'token' });

      // Act
      await controller.signIn(signInDto);

      // Assert
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        'complex+email.with-special_chars@example-domain.co.uk',
        'password123',
      );
    });

    it('should handle case sensitivity properly', async () => {
      // Arrange
      const signInDto: SignInDto = {
        username: 'MixedCase@Example.com',
        password: 'Password123',
      };

      mockAuthService.signIn.mockResolvedValue({ access_token: 'token' });

      // Act
      await controller.signIn(signInDto);

      // Assert
      // Should pass exactly as received to service, which handles case sensitivity rules
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        'MixedCase@Example.com',
        'Password123',
      );
    });
  });
});
