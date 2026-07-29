import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const TablePagination = ({
  page,
  setPage,
  totalItems,
  itemsPerPage = 10,
  itemLabel = 'items',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const startItem = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1
  const endItem = Math.min(page * itemsPerPage, totalItems)

  const visiblePages = []
  for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
    const isBoundaryPage =
      currentPage === 1 || currentPage === totalPages
    const isNearCurrentPage = Math.abs(currentPage - page) <= 1

    if (isBoundaryPage || isNearCurrentPage) {
      visiblePages.push(currentPage)
    }
  }

  if (totalItems <= itemsPerPage) {
    return null
  }

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing {startItem}-{endItem} of {totalItems} {itemLabel}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              onClick={(event) => {
                event.preventDefault()
                if (page > 1) {
                  setPage(page - 1)
                }
              }}
            />
          </PaginationItem>

          {visiblePages.map((currentPage, index) => {
            const previousPage = visiblePages[index - 1]
            const shouldShowEllipsis = previousPage && currentPage - previousPage > 1

            return (
              <div key={currentPage} className="flex items-center">
                {shouldShowEllipsis && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(event) => {
                      event.preventDefault()
                      setPage(currentPage)
                    }}
                  >
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
              </div>
            )
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              onClick={(event) => {
                event.preventDefault()
                if (page < totalPages) {
                  setPage(page + 1)
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default TablePagination
