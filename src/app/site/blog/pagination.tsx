import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, setCurrentPage }: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <nav className="flex justify-center pt-16" role="navigation" aria-label="Pagination Navigation">
      <ul className="inline-flex flex-wrap font-medium text-sm -m-1">
        <li className="m-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="inline-flex h-10 min-w-10 justify-center items-center bg-gray-800 px-4 rounded-full text-gray-500"
            disabled={currentPage === 1}
          >
            Prev
          </button>
        </li>
        {[...Array(totalPages)].map((_, index) => (
          <li className="m-1" key={index}>
            <button
              onClick={() => handlePageChange(index + 1)}
              className={`inline-flex h-10 min-w-10 justify-center items-center bg-gray-800 px-2 rounded-full text-gray-300 ${
                currentPage === index + 1 ? 'bg-purple-600' : 'hover:bg-purple-600 transition-colors duration-150 ease-in-out'
              }`}
            >
              {index + 1}
            </button>
          </li>
        ))}
        <li className="m-1">
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="inline-flex h-10 min-w-10 justify-center items-center bg-gray-800 px-4 rounded-full text-gray-300 hover:bg-purple-600 transition-colors duration-150 ease-in-out"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
