import { LibraryService } from "../LibraryService";
import type {
  Book,
  IBookRepository,
  IStudentRepository,
  NotificationService,
  Student
} from "../types";

function makeDeps() {
  const bookRepository: jest.Mocked<IBookRepository> = {
    GetBookById: jest.fn(),
    UpdateBook: jest.fn()
  };

  const studentRepository: jest.Mocked<IStudentRepository> = {
    GetStudentById: jest.fn()
  };

  const notificationService: jest.Mocked<NotificationService> = {
    SendSuccessNotification: jest.fn(),
    SendWarningNotification: jest.fn()
  };

  const service = new LibraryService(bookRepository, studentRepository, notificationService);

  return { service, bookRepository, studentRepository, notificationService };
}

describe("LibraryService.BorrowBook", () => {
  test("1) returns failure when student not found", () => {
    const { service, studentRepository, bookRepository, notificationService } = makeDeps();

    studentRepository.GetStudentById.mockReturnValue(null);

    const result = service.BorrowBook(1, 10);

    expect(result.Success).toBe(false);
    expect(result.Message).toContain("Student");

    expect(bookRepository.GetBookById).not.toHaveBeenCalled();
    expect(bookRepository.UpdateBook).not.toHaveBeenCalled();

    expect(notificationService.SendWarningNotification).toHaveBeenCalledTimes(1);
    expect(notificationService.SendSuccessNotification).not.toHaveBeenCalled();
  });

  test("2) returns failure when book not found", () => {
    const { service, studentRepository, bookRepository, notificationService } = makeDeps();

    const student: Student = { Id: 1, Name: "Alice", Grade: 10 };
    studentRepository.GetStudentById.mockReturnValue(student);

    bookRepository.GetBookById.mockReturnValue(null);

    const result = service.BorrowBook(1, 10);

    expect(result.Success).toBe(false);
    expect(result.Message).toContain("Book");

    expect(bookRepository.UpdateBook).not.toHaveBeenCalled();

    expect(notificationService.SendWarningNotification).toHaveBeenCalledTimes(1);
    expect(notificationService.SendSuccessNotification).not.toHaveBeenCalled();
  });

  test("3) returns failure when book is not available", () => {
    const { service, studentRepository, bookRepository, notificationService } = makeDeps();

    const student: Student = { Id: 1, Name: "Alice", Grade: 10 };
    studentRepository.GetStudentById.mockReturnValue(student);

    const book: Book = { Id: 10, Title: "1984", Author: "Orwell", IsAvailable: false };
    bookRepository.GetBookById.mockReturnValue(book);

    const result = service.BorrowBook(1, 10);

    expect(result.Success).toBe(false);
    expect(result.Message).toContain("not available");

    expect(bookRepository.UpdateBook).not.toHaveBeenCalled();

    expect(notificationService.SendWarningNotification).toHaveBeenCalledTimes(1);
    expect(notificationService.SendSuccessNotification).not.toHaveBeenCalled();
  });

  test("4/5/6) updates book, sends success notification, and returns success", () => {
    const { service, studentRepository, bookRepository, notificationService } = makeDeps();

    const student: Student = { Id: 1, Name: "Alice", Grade: 10 };
    studentRepository.GetStudentById.mockReturnValue(student);

    const book: Book = { Id: 10, Title: "1984", Author: "Orwell", IsAvailable: true };
    bookRepository.GetBookById.mockReturnValue(book);

    const result = service.BorrowBook(1, 10);

    expect(result.Success).toBe(true);
    expect(result.Message).toContain("borrowed successfully");

    expect(bookRepository.UpdateBook).toHaveBeenCalledTimes(1);
    expect(bookRepository.UpdateBook).toHaveBeenCalledWith({
      ...book,
      IsAvailable: false
    });

    expect(notificationService.SendSuccessNotification).toHaveBeenCalledTimes(1);
    expect(notificationService.SendSuccessNotification).toHaveBeenCalledWith("Alice", "1984");

    expect(notificationService.SendWarningNotification).not.toHaveBeenCalled();
  });
});