import { useState, useEffect } from "react";
import { borrowBook, fetchBooks } from "./server/api";
import "./App.css";

interface Book {
  id: number;
  name: string;
  title: string;
  author: string;
  series_title: string;
  publisher: string;
  place_of_publication: string;
  year: number;
  edition: string;
  volume: string;
  physical_description: string;
  isbn: string;
  accession_number: string;
  call_number: string;
  barcode: string;
  date_received: string;
  subject: string;
  description: string;
  additional_author: string;
  status: string;
  date_processed: string;
  copies: number;
  book_cover: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  cancelled: boolean;
  processed_by: number;
  created_by: number | null;
  updated_by: number | null;
  cancelled_by: number | null;
}

interface BorrowRequest {
  bookId: number;
  bookTitle: string;
  author: string;
  isbn: string;
  borrowDate: string;
  returnDate: string;
  purpose: string;
}

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowRequest, setBorrowRequest] = useState<BorrowRequest>({
    bookId: 0,
    bookTitle: "",
    author: "",
    isbn: "",
    borrowDate: new Date().toISOString().split("T")[0],
    returnDate: "",
    purpose: "",
  });

  const searchBooks = async (searchTerm: string, pageNum: number) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchBooks(pageNum, searchTerm);
      setBooks(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (err: any) {
      setError(err.message || "Failed to fetch books");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchBooks(searchQuery, page);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    searchBooks(searchQuery, 1);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "#10b981";
      case "borrowed":
        return "#f59e0b";
      case "reserved":
        return "#3b82f6";
      case "unavailable":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const handleBorrowClick = (book: Book) => {
    setSelectedBook(book);
    setBorrowRequest({
      bookId: book.id,
      bookTitle: book.title,
      author: book.author,
      isbn: book.isbn,
      borrowDate: new Date().toISOString().split("T")[0],
      returnDate: "",
      purpose: "",
    });
    setShowBorrowModal(true);
  };

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const borrowData = {
        book: borrowRequest.bookId,
        borrow_date: borrowRequest.borrowDate,
        due_date: borrowRequest.returnDate,
        purpose: borrowRequest.purpose || undefined,
      };
      await borrowBook(borrowData);
      console.log("Borrow request submitted:", borrowRequest);
      alert("Borrow request submitted successfully!");
      setShowBorrowModal(false);
      setSelectedBook(null);
      searchBooks(searchQuery, page);
    } catch (err: any) {
      alert("Failed to submit borrow request: " + err.message);
    }
  };

  const handleModalClose = () => {
    setShowBorrowModal(false);
    setSelectedBook(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>eLabrary Book Search</h1>
        <p className="subtitle">Search and discover available books</p>
      </header>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by title, author, ISBN, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading books...</p>
        </div>
      ) : (
        <>
          <div className="results-info">
            {books.length > 0 ? (
              <p>
                Found {books.length} book{books.length !== 1 ? "s" : ""}
              </p>
            ) : (
              <p>No books found. Try a different search term.</p>
            )}
          </div>

          <div className="books-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-card-header">
                  <div className="book-cover-placeholder">
                    {book.book_cover ? (
                      <img
                        src={book.book_cover}
                        alt={book.title}
                        className="book-cover-image"
                      />
                    ) : (
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="book-status-badge">
                    <span
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(book.status) }}
                    ></span>
                    <span className="status-text">{book.status}</span>
                  </div>
                </div>

                <div className="book-card-body">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  {book.additional_author && (
                    <p className="book-additional-author">
                      Co-author: {book.additional_author}
                    </p>
                  )}

                  <div className="book-details">
                    <div className="detail-row">
                      <span className="detail-label">Publisher:</span>
                      <span className="detail-value">{book.publisher}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Year:</span>
                      <span className="detail-value">{book.year}</span>
                    </div>
                    {book.isbn && (
                      <div className="detail-row">
                        <span className="detail-label">ISBN:</span>
                        <span className="detail-value">{book.isbn}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Call Number:</span>
                      <span className="detail-value">{book.call_number}</span>
                    </div>
                    {book.subject && (
                      <div className="detail-row">
                        <span className="detail-label">Subject:</span>
                        <span className="detail-value">{book.subject}</span>
                      </div>
                    )}
                  </div>

                  <div className="book-availability">
                    <div className="availability-item">
                      <span className="availability-label">
                        Copies Available:
                      </span>
                      <span className="availability-value">{book.copies}</span>
                    </div>
                    {book.edition && (
                      <div className="availability-item">
                        <span className="availability-label">Edition:</span>
                        <span className="availability-value">
                          {book.edition}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    className="borrow-button"
                    onClick={() => handleBorrowClick(book)}
                    disabled={book.status.toLowerCase() !== "available"}
                  >
                    {book.status.toLowerCase() === "available"
                      ? "Borrow Book"
                      : "Unavailable"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {books.length > 0 && totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Borrow Modal */}
      {showBorrowModal && selectedBook && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Borrow Book Request</h2>
              <button
                className="modal-close"
                onClick={handleModalClose}
                aria-label="Close modal"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBorrowSubmit} className="borrow-form">
              <div className="form-section">
                <h3>Book Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Book Title</label>
                    <input
                      type="text"
                      value={borrowRequest.bookTitle}
                      disabled
                      className="form-input disabled"
                    />
                  </div>
                  <div className="form-group">
                    <label>Author</label>
                    <input
                      type="text"
                      value={borrowRequest.author}
                      disabled
                      className="form-input disabled"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>ISBN</label>
                    <input
                      type="text"
                      value={borrowRequest.isbn}
                      disabled
                      className="form-input disabled"
                    />
                  </div>
                  <div className="form-group">
                    <label>Call Number</label>
                    <input
                      type="text"
                      value={selectedBook.call_number}
                      disabled
                      className="form-input disabled"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Borrow Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Borrow Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      value={borrowRequest.borrowDate}
                      onChange={(e) =>
                        setBorrowRequest({
                          ...borrowRequest,
                          borrowDate: e.target.value,
                        })
                      }
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Return Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      value={borrowRequest.returnDate}
                      onChange={(e) =>
                        setBorrowRequest({
                          ...borrowRequest,
                          returnDate: e.target.value,
                        })
                      }
                      required
                      min={borrowRequest.borrowDate}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Purpose</label>
                  <textarea
                    value={borrowRequest.purpose}
                    onChange={(e) =>
                      setBorrowRequest({
                        ...borrowRequest,
                        purpose: e.target.value,
                      })
                    }
                    className="form-textarea"
                    placeholder="Enter the purpose of borrowing (optional)"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
