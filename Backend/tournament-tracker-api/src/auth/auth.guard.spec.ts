// auth.guard.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockJwtService: DeepMocked<JwtService>;
  let mockReflector: DeepMocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
        {
          provide: Reflector,
          useValue: createMock<Reflector>(),
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    mockJwtService = module.get<DeepMocked<JwtService>>(JwtService);
    mockReflector = module.get<DeepMocked<Reflector>>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: DeepMocked<ExecutionContext>;
    let mockRequest: {
      headers: any;
      user?: any;
    };

    beforeEach(() => {
      mockJwtService.verifyAsync.mockClear();
      mockReflector.getAllAndOverride.mockClear();

      mockRequest = {
        headers: {},
      };

      mockReflector.getAllAndOverride.mockReturnValue(false);

      // Create a mock execution context
      mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext.switchToHttp.mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
    });

    it('should throw UnauthorizedException when no authorization header is present', async () => {
      // Arrange
      mockRequest.headers.authorization = undefined;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header does not contain Bearer token', async () => {
      // Arrange
      mockRequest.headers.authorization = 'NotBearer token123';

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when Bearer token is empty', async () => {
      // Arrange
      mockRequest.headers.authorization = 'Bearer ';

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when JWT verification fails', async () => {
      // Arrange
      mockRequest.headers.authorization = 'Bearer validTokenFormat';
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'validTokenFormat',
        { secret: jwtConstants.secret },
      );
    });

    it('should allow request when JWT verification succeeds', async () => {
      // Arrange
      const validToken = 'validTokenString';
      const decodedToken = { sub: 1, username: 'testuser' };

      mockRequest.headers.authorization = `Bearer ${validToken}`;
      mockJwtService.verifyAsync.mockResolvedValue(decodedToken);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(validToken, {
        secret: jwtConstants.secret,
      });
      expect(mockRequest.user).toEqual(decodedToken);
    });

    it('should extract token correctly from authorization header', async () => {
      // Arrange
      const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciJ9.signature';
      const decodedToken = { sub: 1, username: 'testuser' };

      mockRequest.headers.authorization = `Bearer ${validToken}`;
      mockJwtService.verifyAsync.mockResolvedValue(decodedToken);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(validToken, {
        secret: jwtConstants.secret,
      });
    });

    it('should handle complex Bearer tokens with special characters', async () => {
      // Arrange
      const complexToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const decodedToken = {
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022,
      };

      mockRequest.headers.authorization = `Bearer ${complexToken}`;
      mockJwtService.verifyAsync.mockResolvedValue(decodedToken);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(complexToken, {
        secret: jwtConstants.secret,
      });
      expect(mockRequest.user).toEqual(decodedToken);
    });

    it('should handle requests with additional headers beyond authorization', async () => {
      // Arrange
      const validToken = 'validTokenString';
      const decodedToken = { sub: 1, username: 'testuser' };

      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
        'content-type': 'application/json',
        accept: '*/*',
        'user-agent': 'Jest Test',
      };

      mockJwtService.verifyAsync.mockResolvedValue(decodedToken);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(validToken, {
        secret: jwtConstants.secret,
      });
    });

    it('should handle case-insensitive "bearer" in authorization header', async () => {
      // Arrange
      const validToken = 'validTokenString';
      const decodedToken = { sub: 1, username: 'testuser' };

      // Using different casing for "bearer"
      mockRequest.headers.authorization = `bearer ${validToken}`;
      mockJwtService.verifyAsync.mockResolvedValue(decodedToken);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(validToken, {
        secret: jwtConstants.secret,
      });
    });

    it('should skip JWT validation for routes marked as public', async () => {
      // Arrange
      mockReflector.getAllAndOverride.mockReturnValue(true); // Simulate @Public() decorator

      // No auth header needed for public routes
      mockRequest.headers.authorization = undefined;

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        [
          mockExecutionContext.getHandler(), // Handler
          mockExecutionContext.getClass(), // Class
        ],
      );
      // Verify JWT service wasn't called since route is public
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should check for both handler and controller level @Public() decorators', async () => {
      // Arrange
      mockReflector.getAllAndOverride.mockReturnValue(true);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        expect.arrayContaining([
          expect.anything(), // Should check the handler
          expect.anything(), // Should check the controller
        ]),
      );
    });

    it('should allow access to public routes even with an invalid token', async () => {
      // Arrange - public route with invalid token
      mockReflector.getAllAndOverride.mockReturnValue(true);
      mockRequest.headers.authorization = `Bearer invalidToken`;

      // Would throw if token was verified
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      // Verify JWT service wasn't called since route is public
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should prioritize @Public() decorator over missing auth token', async () => {
      // Arrange - public route with no auth token
      mockReflector.getAllAndOverride.mockReturnValue(true);
      mockRequest.headers.authorization = undefined;

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });
  });
});
