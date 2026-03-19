import { LibraryService } from './LibraryService';
import {
  Book,
  IBookRepository,
  INotificationService,
  IStudentRepository,
  Student,
} from './interfaces';

describe('LibraryService.BorrowBook', () => {
  let bookRepository: jest.Mocked<IBookRepository>;
  let studentRepository: jest.Mocked<IStudentRepository>;
  let notificationService: jest.Mocked<INotificationService>;
  let service: LibraryService;

  const mockStudent: Student = { Id: 1, Name: 'Alice', Grade: 10 };
  const mockBook: Book = { Id: 42, Title: 'Clean Code', Author: 'Robert Martin', IsAvailable: true };

  beforeEach(() => {
    bookRepository = {
      GetBookById: jest.fn(),
      UpdateBook: jest.fn(),
    };
    studentRepository = {
      GetStudentById: jest.fn(),
    };
    notificationService = {
      SendSuccessNotification: jest.fn(),
      SendWarningNotification: jest.fn(),
    };
    service = new LibraryService(bookRepository, studentRepository, notificationService);
  });

  it('returns unsuccessful result when student is not found', () => {
    studentRepository.GetStudentById.mockReturnValue(null);

    const result = service.BorrowBook(1, 42);

    expect(result.Success).toBe(false);
    expect(result.Message).toBe('Student not found');
    expect(bookRepository.GetBookById).not.toHaveBeenCalled();
    expect(bookRepository.UpdateBook).not.toHaveBeenCalled();
    expect(notificationService.SendSuccessNotification).not.toHaveBeenCalled();
    expect(notificationService.SendWarningNotification).not.toHaveBeenCalled();
  });

  it('returns unsuccessful result when book is not found', () => {
    studentRepository.GetStudentById.mockReturnValue(mockStudent);
    bookRepository.GetBookById.mockReturnValue(null);

    const result = service.BorrowBook(1, 42);

    expect(result.Success).toBe(false);
    expect(result.Message).toBe('Book not found');
    expect(bookRepository.UpdateBook).not.toHaveBeenCalled();
    expect(notificationService.SendSuccessNotification).not.toHaveBeenCalled();
    expect(notificationService.SendWarningNotification).not.toHaveBeenCalled();
  });

  it('returns unsuccessful result when book is not available', () => {
    const unavailableBook: Book = { ...mockBook, IsAvailable: false };
    studentRepository.GetStudentById.mockReturnValue(mockStudent);
    bookRepository.GetBookById.mockReturnValue(unavailableBook);

    const result = service.BorrowBook(1, 42);

    expect(result.Success).toBe(false);
    expect(result.Message).toBe('Book is not available');
    expect(bookRepository.UpdateBook).not.toHaveBeenCalled();
    expect(notificationService.SendSuccessNotification).not.toHaveBeenCalled();
    expect(notificationService.SendWarningNotification).not.toHaveBeenCalled();
  });

  it('returns successful result and updates book and sends notification on happy path', () => {
    const availableBook: Book = { ...mockBook, IsAvailable: true };
    studentRepository.GetStudentById.mockReturnValue(mockStudent);
    bookRepository.GetBookById.mockReturnValue(availableBook);

    const result = service.BorrowBook(1, 42);

    expect(result.Success).toBe(true);
    expect(result.Message).toBe('Book successfully borrowed');
    expect(bookRepository.UpdateBook).toHaveBeenCalledWith({ ...mockBook, IsAvailable: false });
    expect(notificationService.SendSuccessNotification).toHaveBeenCalledWith(
      mockStudent.Name,
      mockBook.Title,
    );
    expect(notificationService.SendWarningNotification).not.toHaveBeenCalled();
  });
});
