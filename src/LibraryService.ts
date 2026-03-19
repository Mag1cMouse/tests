import {
  BorrowResult,
  IBookRepository,
  INotificationService,
  IStudentRepository,
} from './interfaces'

export class LibraryService {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly studentRepository: IStudentRepository,
    private readonly notificationService: INotificationService,
  ) {}

  BorrowBook(studentId: number, bookId: number): BorrowResult {
    const student = this.studentRepository.GetStudentById(studentId);
    if (!student) {
      return { Success: false, Message: 'Student not found' };
    }

    const book = this.bookRepository.GetBookById(bookId);
    if (!book) {
      return { Success: false, Message: 'Book not found' };
    }

    if (!book.IsAvailable) {
      return { Success: false, Message: 'Book is not available' };
    }

    book.IsAvailable = false;
    this.bookRepository.UpdateBook(book);

    this.notificationService.SendSuccessNotification(student.Name, book.Title);

    return { Success: true, Message: 'Book successfully borrowed' };
  }
}
