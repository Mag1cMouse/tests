import {
  BorrowResult,
  IBookRepository,
  IStudentRepository,
  NotificationService
} from "./types";

export class LibraryService {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly studentRepository: IStudentRepository,
    private readonly notificationService: NotificationService
  ) {}

  BorrowBook(studentId: number, bookId: number): BorrowResult {
    const student = this.studentRepository.GetStudentById(studentId);
    if (student === null) {
      const message = `Student with id=${studentId} not found`;
      this.notificationService.SendWarningNotification(message);
      return { Success: false, Message: message };
    }

    const book = this.bookRepository.GetBookById(bookId);
    if (book === null) {
      const message = `Book with id=${bookId} not found`;
      this.notificationService.SendWarningNotification(message);
      return { Success: false, Message: message };
    }

    if (!book.IsAvailable) {
      const message = `Book "${book.Title}" is not available`;
      this.notificationService.SendWarningNotification(message);
      return { Success: false, Message: message };
    }

    // Borrow => becomes unavailable
    const updatedBook = { ...book, IsAvailable: false };
    this.bookRepository.UpdateBook(updatedBook);

    this.notificationService.SendSuccessNotification(student.Name, book.Title);

    return { Success: true, Message: `Book "${book.Title}" borrowed successfully` };
  }
}