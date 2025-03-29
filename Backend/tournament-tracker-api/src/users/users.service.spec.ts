import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let service: UsersService;
  let mockUsersRepository: DeepMocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockUsersRepository = module.get<DeepMocked<Repository<User>>>(
      getRepositoryToken(User),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return a user when user exists', async () => {
      // Arrange
      const userId = 1;
      const mockUser = new User();
      mockUser.userId = userId;
      mockUser.firstName = 'John';
      mockUser.lastName = 'Doe';
      mockUser.emailAddress = 'john.doe@example.com';

      mockUsersRepository.findOneBy.mockResolvedValue(mockUser);

      // Act
      const result = await service.get(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ userId });
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      const userId = 999; // Non-existent user ID
      mockUsersRepository.findOneBy.mockResolvedValue(null);

      // Act
      const result = await service.get(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ userId });
    });

    it('should throw an error if repository throws an error', async () => {
      // Arrange
      const userId = 1;
      const errorMessage = 'Database connection error';
      mockUsersRepository.findOneBy.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.get(userId)).rejects.toThrow(errorMessage);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ userId });
    });
  });

  describe('getBy', () => {
    it('should return a user when user with email exists', async () => {
      // Arrange
      const emailAddress = 'john.doe@example.com';
      const mockUser = new User();
      mockUser.userId = 1;
      mockUser.firstName = 'John';
      mockUser.lastName = 'Doe';
      mockUser.emailAddress = emailAddress;

      mockUsersRepository.findOneBy.mockResolvedValue(mockUser);

      // Act
      const result = await service.getBy(emailAddress);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({
        emailAddress,
      });
    });

    it('should return null when user with email does not exist', async () => {
      // Arrange
      const emailAddress = 'nonexistent@example.com';
      mockUsersRepository.findOneBy.mockResolvedValue(null);

      // Act
      const result = await service.getBy(emailAddress);

      // Assert
      expect(result).toBeNull();
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({
        emailAddress,
      });
    });

    it('should handle empty email string', async () => {
      // Arrange
      const emailAddress = '';
      mockUsersRepository.findOneBy.mockResolvedValue(null);

      // Act
      const result = await service.getBy(emailAddress);

      // Assert
      expect(result).toBeNull();
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({
        emailAddress: '',
      });
    });

    it('should throw an error if repository throws an error', async () => {
      // Arrange
      const emailAddress = 'john.doe@example.com';
      const errorMessage = 'Database connection error';
      mockUsersRepository.findOneBy.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.getBy(emailAddress)).rejects.toThrow(errorMessage);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({
        emailAddress,
      });
    });
  });

  describe('create', () => {
    it('should successfully create a new user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const savedUser = new User();
      savedUser.userId = 1;
      savedUser.firstName = createUserDto.firstName;
      savedUser.lastName = createUserDto.lastName;
      savedUser.emailAddress = createUserDto.email;

      // Mock the save method to return the saved user
      mockUsersRepository.save.mockResolvedValue(savedUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(savedUser);
      expect(mockUsersRepository.save).toHaveBeenCalledTimes(1);

      // Verify that the correct user object was passed to save
      const userPassedToSave = mockUsersRepository.save.mock.calls[0][0];
      expect(userPassedToSave).toBeInstanceOf(User);
      expect(userPassedToSave.firstName).toBe(createUserDto.firstName);
      expect(userPassedToSave.lastName).toBe(createUserDto.lastName);
      expect(userPassedToSave.emailAddress).toBe(createUserDto.email);
    });

    it('should map DTO properties correctly to the User entity', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      };

      // Capture the user entity that's passed to save
      mockUsersRepository.save.mockImplementation(async (user) => {
        const savedUser = user as User;
        savedUser.userId = 2; // Simulate DB assigning an ID
        return savedUser;
      });

      // Act
      await service.create(createUserDto);

      // Assert
      const userPassedToSave = mockUsersRepository.save.mock.calls[0][0];
      expect(userPassedToSave.firstName).toBe('Jane');
      expect(userPassedToSave.lastName).toBe('Smith');
      expect(userPassedToSave.emailAddress).toBe('jane.smith@example.com');
    });

    it('should throw an error if repository save fails', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const errorMessage = 'Database error during save';
      mockUsersRepository.save.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(errorMessage);
      expect(mockUsersRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle empty firstName in DTO', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: '',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const savedUser = new User();
      savedUser.userId = 3;
      savedUser.firstName = '';
      savedUser.lastName = 'Doe';
      savedUser.emailAddress = 'john.doe@example.com';

      mockUsersRepository.save.mockResolvedValue(savedUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result.firstName).toBe('');
      expect(mockUsersRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle empty lastName in DTO', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: '',
        email: 'john.doe@example.com',
      };

      const savedUser = new User();
      savedUser.userId = 4;
      savedUser.firstName = 'John';
      savedUser.lastName = '';
      savedUser.emailAddress = 'john.doe@example.com';

      mockUsersRepository.save.mockResolvedValue(savedUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result.lastName).toBe('');
      expect(mockUsersRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should successfully update a user', async () => {
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

      mockUsersRepository.update.mockResolvedValue(updateResult);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updateResult);
      expect(mockUsersRepository.update).toHaveBeenCalledTimes(1);

      // Verify that update was called with the correct parameters
      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        userId,
        expect.any(User),
      );

      // Verify the user object passed to update has the correct properties
      const userPassedToUpdate = mockUsersRepository.update.mock.calls[0][1];
      expect(userPassedToUpdate.firstName).toBe(updateUserDto.firstName);
      expect(userPassedToUpdate.lastName).toBe(updateUserDto.lastName);
    });

    it('should return update result when no rows affected', async () => {
      // Arrange
      const userId = 999; // Non-existent ID
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated First Name',
        lastName: 'Updated Last Name',
      };

      const updateResult: UpdateResult = {
        affected: 0, // No rows affected
        raw: {},
        generatedMaps: [],
      };

      mockUsersRepository.update.mockResolvedValue(updateResult);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updateResult);
      expect(result.affected).toBe(0);
      expect(mockUsersRepository.update).toHaveBeenCalledTimes(1);
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

      mockUsersRepository.update.mockResolvedValue(updateResult);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updateResult);

      // Verify the user object passed to update has the correct property
      const userPassedToUpdate = mockUsersRepository.update.mock.calls[0][1];
      expect(userPassedToUpdate.firstName).toBe(updateUserDto.firstName);
      expect(userPassedToUpdate.lastName).toBeUndefined();
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

      mockUsersRepository.update.mockResolvedValue(updateResult);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updateResult);

      // Verify the user object passed to update has the correct property
      const userPassedToUpdate = mockUsersRepository.update.mock.calls[0][1];
      expect(userPassedToUpdate.lastName).toBe(updateUserDto.lastName);
      expect(userPassedToUpdate.firstName).toBeUndefined();
    });

    it('should handle empty strings in update fields', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: '',
        lastName: '',
      };

      const updateResult: UpdateResult = {
        affected: 0,
        raw: {},
        generatedMaps: [],
      };

      mockUsersRepository.update.mockResolvedValue(updateResult);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(mockUsersRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual(updateResult);
    });

    it('should throw an error if repository update fails', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated First Name',
        lastName: 'Updated Last Name',
      };

      const errorMessage = 'Database error during update';
      mockUsersRepository.update.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        errorMessage,
      );
      expect(mockUsersRepository.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delet', () => {
    it('should successfully delete a user', async () => {
      // Arrange
      const userId = 1;
      const deleteResult: DeleteResult = {
        affected: 1,
        raw: {},
      };

      mockUsersRepository.delete.mockResolvedValue(deleteResult);

      // Act
      await service.delet(userId);

      // Assert
      expect(mockUsersRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should not throw error when deleting non-existent user', async () => {
      // Arrange
      const userId = 999; // Non-existent ID
      const deleteResult: DeleteResult = {
        affected: 0, // No rows affected
        raw: {},
      };

      mockUsersRepository.delete.mockResolvedValue(deleteResult);

      // Act & Assert
      await expect(service.delet(userId)).resolves.not.toThrow();
      expect(mockUsersRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if repository delete fails', async () => {
      // Arrange
      const userId = 1;
      const errorMessage = 'Database error during delete';
      mockUsersRepository.delete.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.delet(userId)).rejects.toThrow(errorMessage);
      expect(mockUsersRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle deleting with negative userId', async () => {
      // Arrange
      const userId = -1;
      const deleteResult: DeleteResult = {
        affected: 0,
        raw: {},
      };

      mockUsersRepository.delete.mockResolvedValue(deleteResult);

      // Act
      await service.delet(userId);

      // Assert
      expect(mockUsersRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should handle deleting with zero userId', async () => {
      // Arrange
      const userId = 0;
      const deleteResult: DeleteResult = {
        affected: 0,
        raw: {},
      };

      mockUsersRepository.delete.mockResolvedValue(deleteResult);

      // Act
      await service.delet(userId);

      // Assert
      expect(mockUsersRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should work when delete affects multiple records', async () => {
      // Arrange
      const userId = 1;
      // This scenario is unlikely with a primary key delete,
      // but testing for robustness
      const deleteResult: DeleteResult = {
        affected: 2, // Multiple rows affected
        raw: {},
      };

      mockUsersRepository.delete.mockResolvedValue(deleteResult);

      // Act
      await service.delet(userId);

      // Assert
      expect(mockUsersRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.delete).toHaveBeenCalledWith(userId);
    });
  });
});
