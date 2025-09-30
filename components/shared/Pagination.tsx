// Pagination Component
import React from 'react'
import { Button } from '@/components/ui'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showInfo?: {
    start: number
    end: number
    total: number
  } | boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo
}: PaginationProps) {
  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    // Always show first page
    if (totalPages <= 1) return [1]

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    // Remove duplicates
    return rangeWithDots.filter((item, index, arr) =>
      index === 0 || item !== arr[index - 1]
    )
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">

      <div className="flex flex-col items-center justify-between sm:justify-end gap-3 w-full">
        {showInfo && (
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-700">

              {totalPages > 1 && (
                <span className="text-gray-500 ml-2">
                  Showing Page {currentPage} of {totalPages}
                </span>
              )}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Previous</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
            <span className="ml-1 hidden sm:inline">Previous</span>
          </Button>

          <div className="hidden sm:flex items-center space-x-1">
            {getPageNumbers().map((pageNumber, index) => (
              <span key={index}>
                {pageNumber === '...' ? (
                  <span className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                    ...
                  </span>
                ) : (
                  <Button
                    variant={currentPage === pageNumber ? "primary" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNumber as number)}
                    className={`relative inline-flex items-center px-3 py-2 text-sm font-semibold transition-colors ${currentPage === pageNumber
                      ? 'bg-teal-600 text-white hover:bg-teal-700 focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                  >
                    {pageNumber}
                  </Button>
                )}
              </span>
            ))}
          </div>

          {/* Mobile page indicator */}
          <div className="sm:hidden">
            <span className="text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-1 hidden sm:inline">Next</span>
            <span className="sr-only">Next</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
