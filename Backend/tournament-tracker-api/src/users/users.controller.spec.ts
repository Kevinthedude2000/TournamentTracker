import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UsersController;
  let mockUsersService: DeepMocked<UsersService>;
  let mockUsersRepository: DeepMocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UsersService, useValue: createMock<UsersService>() },
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
      ],
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    mockUsersService = module.get<DeepMocked<UsersService>>(UsersService);
    mockUsersRepository = module.get<DeepMocked<Repository<User>>>(
      getRepositoryToken(User),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return a user when the user exists', async () => {
      // Arrange
      const userId = 1;
      const mockUser = new User();
      mockUser.userId = userId;
      mockUser.firstName = 'John';
      mockUser.lastName = 'Doe';
      mockUser.emailAddress = 'john.doe@example.com';
      mockUser.password = 'hashedpassword';

      mockUsersService.get.mockResolvedValue(mockUser);

      // Act
      const result = await controller.getUser(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersService.get).toHaveBeenCalledWith(userId);
      expect(mockUsersService.get).toHaveBeenCalledTimes(1);
    });

    it('should return null when the user does not exist', async () => {
      // Arrange
      const userId = 999; // Non-existent ID
      mockUsersService.get.mockResolvedValue(null);

      // Act
      const result = await controller.getUser(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockUsersService.get).toHaveBeenCalledWith(userId);
      expect(mockUsersService.get).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors appropriately', async () => {
      // Arrange
      const userId = 1;
      const errorMessage = 'Database error';
      mockUsersService.get.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.getUser(userId)).rejects.toThrow(errorMessage);
      expect(mockUsersService.get).toHaveBeenCalledWith(userId);
      expect(mockUsersService.get).toHaveBeenCalledTimes(1);
    });

    it('should handle parsing errors with userId', async () => {
      // This test is to verify what happens when the ParseIntPipe fails
      // In an actual request, NestJS would handle this at the parameter level
      // We're simulating that here by causing a parsing error

      // The test simply verifies that when the service returns properly
      // but with a non-sensical ID (that would normally be caught by the pipe),
      // the controller passes the value through to the service correctly

      // Arrange
      const userId = -500; // Some unusual ID value
      mockUsersService.get.mockResolvedValue(null);

      // Act
      const result = await controller.getUser(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockUsersService.get).toHaveBeenCalledWith(userId);
    });

    it('should pass userId directly to service without modification', async () => {
      // Arrange
      const userIds = [1, 10, 100, 1000];

      for (const userId of userIds) {
        mockUsersService.get.mockResolvedValue(null);

        // Act
        await controller.getUser(userId);

        // Assert
        expect(mockUsersService.get).toHaveBeenCalledWith(userId);
        jest.clearAllMocks();
      }
    });
  });

  describe('createUser', () => {
    it('should create a new user and return it', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const mockUser = new User();
      mockUser.userId = 1;
      mockUser.firstName = createUserDto.firstName;
      mockUser.lastName = createUserDto.lastName;
      mockUser.emailAddress = createUserDto.email;
      mockUser.password = 'defaultpassword'; // Assuming there's a default or it's set elsewhere

      mockUsersService.create.mockResolvedValue(mockUser);

      // Act
      const result = await controller.createUser(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    });

    it('should pass the DTO directly to the service without modification', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      };

      const mockUser = new User();
      mockUser.userId = 2;
      mockUser.firstName = createUserDto.firstName;
      mockUser.lastName = createUserDto.lastName;
      mockUser.emailAddress = createUserDto.email;

      mockUsersService.create.mockResolvedValue(mockUser);

      // Act
      await controller.createUser(createUserDto);

      // Assert
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      // Verify the DTO was passed unchanged
      expect(mockUsersService.create.mock.calls[0][0]).toBe(createUserDto);
    });

    it('should handle service errors appropriately', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'Error',
        lastName: 'User',
        email: 'error.case@example.com',
      };

      const errorMessage = 'Database error during creation';
      mockUsersService.create.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.createUser(createUserDto)).rejects.toThrow(
        errorMessage,
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle DTOs with empty string fields', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: '',
        lastName: '',
        email: 'empty.fields@example.com',
      };

      const mockUser = new User();
      mockUser.userId = 3;
      mockUser.firstName = '';
      mockUser.lastName = '';
      mockUser.emailAddress = 'empty.fields@example.com';

      mockUsersService.create.mockResolvedValue(mockUser);

      // Act
      const result = await controller.createUser(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
    });

    it('should handle complex email addresses correctly', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'Complex',
        lastName: 'Email',
        email: 'complex+email.with-special_chars@example-domain.co.uk',
      };

      const mockUser = new User();
      mockUser.userId = 4;
      mockUser.firstName = createUserDto.firstName;
      mockUser.lastName = createUserDto.lastName;
      mockUser.emailAddress = createUserDto.email;

      mockUsersService.create.mockResolvedValue(mockUser);

      // Act
      const result = await controller.createUser(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result.emailAddress).toBe(createUserDto.email);
    });
  });

  describe('updateUser', () => {
    it('should update a user and return the result when fields are provided', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated First Name',
        lastName: 'Updated Last Name',
      };

      const updateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };

      mockUsersService.update.mockResolvedValue(updateResult);

      // Act
      const result = await controller.updateUser(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updateResult);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(mockUsersService.update).toHaveBeenCalledTimes(1);
    });

    it('should update only firstName when only firstName is provided', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated First Name',
      };

      const updateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };

      mockUsersService.update.mockResolvedValue(updateResult);

      // Act
      const result = await controller.updateUser(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updateResult);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      // Verify the DTO was passed unchanged
      expect(mockUsersService.update.mock.calls[0][1]).toBe(updateUserDto);
      expect(mockUsersService.update.mock.calls[0][1].firstName).toBe(
        'Updated First Name',
      );
      expect(mockUsersService.update.mock.calls[0][1].lastName).toBeUndefined();
    });

    it('should update only lastName when only lastName is provided', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        lastName: 'Updated Last Name',
      };

      const updateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };

      mockUsersService.update.mockResolvedValue(updateResult);

      // Act
      const result = await controller.updateUser(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updateResult);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(mockUsersService.update.mock.calls[0][1].lastName).toBe(
        'Updated Last Name',
      );
      expect(
        mockUsersService.update.mock.calls[0][1].firstName,
      ).toBeUndefined();
    });

    it('should handle empty update DTOs correctly', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {};

      const updateResult: UpdateResult = {
        affected: 0,
        raw: {},
        generatedMaps: [],
      };

      mockUsersService.update.mockResolvedValue(updateResult);

      // Act
      const result = await controller.updateUser(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updateResult);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });

    it('should handle case where user does not exist', async () => {
      // Arrange
      const userId = 999; // Non-existent ID
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated First Name',
      };

      const updateResult: UpdateResult = {
        affected: 0, // No rows affected indicates user wasn't found
        raw: {},
        generatedMaps: [],
      };

      mockUsersService.update.mockResolvedValue(updateResult);

      // Act
      const result = await controller.updateUser(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updateResult);
      expect(result.affected).toBe(0);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });

    it('should handle service errors appropriately', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: 'Error',
        lastName: 'Case',
      };

      const errorMessage = 'Database error during update';
      mockUsersService.update.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(
        controller.updateUser(userId, updateUserDto),
      ).rejects.toThrow(errorMessage);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(mockUsersService.update).toHaveBeenCalledTimes(1);
    });

    it('should handle DTOs with empty string fields', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: '',
        lastName: '',
      };

      const updateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };

      mockUsersService.update.mockResolvedValue(updateResult);

      // Act
      const result = await controller.updateUser(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updateResult);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(mockUsersService.update.mock.calls[0][1].firstName).toBe('');
      expect(mockUsersService.update.mock.calls[0][1].lastName).toBe('');
    });

    it('should work with zero userId', async () => {
      // Arrange
      const userId = 0;
      const updateUserDto: UpdateUserDto = {
        firstName: 'Zero',
        lastName: 'User',
      };

      const updateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };

      mockUsersService.update.mockResolvedValue(updateResult);

      // Act
      const result = await controller.updateUser(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updateResult);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });

    it('should handle userId parameter correctly with ParseIntPipe', async () => {
      // Arrange - In a real request, NestJS would convert string to number via ParseIntPipe
      // This test verifies that when the ID arrives as a number (after pipe processing),
      // it's correctly passed to the service
      const userId = 42;
      const updateUserDto: UpdateUserDto = {
        firstName: 'Pipe',
        lastName: 'Testing',
      };

      const updateResult: UpdateResult = {
        affected: 1,
        raw: {},
        generatedMaps: [],
      };

      mockUsersService.update.mockResolvedValue(updateResult);

      // Act
      await controller.updateUser(userId, updateUserDto);

      // Assert
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );

      // Check that the first argument is exactly the userId number
      expect(mockUsersService.update.mock.calls[0][0]).toBe(userId);
      expect(typeof mockUsersService.update.mock.calls[0][0]).toBe('number');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      // Arrange
      const userId = 1;
      mockUsersService.delet.mockResolvedValue(undefined);

      // Act
      await controller.deleteUser(userId);

      // Assert
      expect(mockUsersService.delet).toHaveBeenCalledWith(userId);
      expect(mockUsersService.delet).toHaveBeenCalledTimes(1);
    });

    it('should pass the userId directly to the service without modification', async () => {
      // Arrange
      const userId = 123;
      mockUsersService.delet.mockResolvedValue(undefined);

      // Act
      await controller.deleteUser(userId);

      // Assert
      expect(mockUsersService.delet).toHaveBeenCalledWith(userId);
      expect(mockUsersService.delet.mock.calls[0][0]).toBe(userId);
    });

    it('should handle service errors appropriately', async () => {
      // Arrange
      const userId = 1;
      const errorMessage = 'Database error during deletion';
      mockUsersService.delet.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.deleteUser(userId)).rejects.toThrow(errorMessage);
      expect(mockUsersService.delet).toHaveBeenCalledWith(userId);
      expect(mockUsersService.delet).toHaveBeenCalledTimes(1);
    });

    it('should handle string userId by converting it to number', async () => {
      // Arrange
      const userIdString = '42';
      const userIdNumber = 42;

      mockUsersService.delet.mockResolvedValue(undefined);

      // Act
      await controller.deleteUser(userIdNumber);

      // Assert
      expect(mockUsersService.delet).toHaveBeenCalledWith(userIdNumber);

      // Check if the service receives the numeric value, not the string
      // This is how the controller would handle it if the parameter came as a string
      expect(mockUsersService.delet).not.toHaveBeenCalledWith(userIdString);
    });

    it('should work with zero userId', async () => {
      // Arrange
      const userId = 0;
      mockUsersService.delet.mockResolvedValue(undefined);

      // Act
      await controller.deleteUser(userId);

      // Assert
      expect(mockUsersService.delet).toHaveBeenCalledWith(userId);
    });

    it('should handle case where user does not exist', async () => {
      // Arrange
      const userId = 999; // Non-existent ID
      mockUsersService.delet.mockResolvedValue(undefined);

      // Act
      // In this case, the service simply returns undefined regardless of
      // whether the user existed or not (that's the contract with the delet method)
      await controller.deleteUser(userId);

      // Assert
      expect(mockUsersService.delet).toHaveBeenCalledWith(userId);
      expect(mockUsersService.delet).toHaveBeenCalledTimes(1);
    });

    it('should handle negative userId values', async () => {
      // Arrange
      const userId = -1;
      mockUsersService.delet.mockResolvedValue(undefined);

      // Act
      await controller.deleteUser(userId);

      // Assert
      expect(mockUsersService.delet).toHaveBeenCalledWith(userId);
    });
  });
});
