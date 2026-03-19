export interface Book {
  Id: number;
  Title: string;
  Author: string;
  IsAvailable: boolean;
}

export interface Student {
  Id: number;
  Name: string;
  Grade: number;
}

export interface BorrowResult {
  Success: boolean;
  Message: string;
}

export interface IBookRepository {
  GetBookById(id: number): Book | null;
  UpdateBook(book: Book): void;
}

export interface IStudentRepository {
  GetStudentById(id: number): Student | null;
}

export interface INotificationService {
  SendSuccessNotification(studentName: string, bookTitle: string): void;
  SendWarningNotification(message: string): void;
}
