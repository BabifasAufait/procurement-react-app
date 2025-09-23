import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterIcon, MagnifyingGlass, SortIcon } from "../../utils/Icons";
import ShowStatus from "../buttons/ShowStatus";
import { IFilterDto } from "../../types/commonTypes";
import DropdownMenu from "./DropdownMenu";
import { EllipsisVerticalIcon } from "lucide-react";

interface IDot {
  setEditOption?: (data: any) => void;
  setBlockOption?: (data: any) => void;
  setDeleteOption?: (data: any) => void;
}

interface TableProps extends Partial<IDot> {
  title: string;
  columns: string[];
  items: any[];
  dots?: boolean;
  trigger?: () => void;
  columnLabels: Record<string, string>;
  filter?: IFilterDto;
  setFilter?: React.Dispatch<React.SetStateAction<IFilterDto>>;
  setIsFilterModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSortModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
  setIsModalOpenItem?: React.Dispatch<React.SetStateAction<any>>;
  totalCount: number;
  rowNavigationPath?: string;
  type: "proposal" | "rfps" | "vendors" | "tendors";
  subtitle: string;
  NoDataTitle?: string;
  NoDataDescription?: string;
  IsIcon: boolean;
}

const Table: React.FC<TableProps> = ({
  title,
  dots = false,
  columns,
  items,
  filter,
  setFilter,
  columnLabels,
  setIsFilterModalOpen,
  setIsSortModalOpen,
  setSearchQuery,
  totalCount,
  rowNavigationPath,
  setBlockOption,
  setDeleteOption,
  setEditOption,
  setIsModalOpenItem,
  trigger,
  subtitle,
  NoDataTitle,
  NoDataDescription,
  IsIcon,
  type,
}) => {
  const [pages, _] = useState<number[]>([]);
  const navigate = useNavigate();
  const currentPage = filter?.pageNo ?? 1;
  //const pageSize = filter?.pageSize ?? 10;
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (totalCount > 0) {
  //     const pagesNeeded = Math.ceil(totalCount / pageSize);
  //     setPages(Array.from({ length: pagesNeeded }, (_, i) => i + 1));
  //   } else {
  //     setPages([]);
  //   }
  // }, [totalCount, pageSize]);
  useEffect(() => {}, [totalCount]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page !== currentPage && setFilter) {
      setFilter((prev) => ({ ...prev, pageNo: page }));
    }
    trigger && trigger();
  };

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  useEffect(() => {
    const handleScroll = () => {
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener("scroll", handleScroll);
    }
    window.addEventListener("scroll", handleScroll);

    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [openDropdown]);

  const toggleDropdown = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();

    if (openDropdown === index) {
      setOpenDropdown(null);
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const containerRect = tableContainerRef.current?.getBoundingClientRect();

      if (containerRect) {
        const isNearBottom = buttonRect.bottom > containerRect.bottom - 50;

        const dropdownHeight = 120;

        let topPosition = buttonRect.bottom + window.scrollY; // default

        if (setDeleteOption && setBlockOption && setEditOption) {
          topPosition = isNearBottom
            ? buttonRect.top + window.scrollY - dropdownHeight + 40
            : buttonRect.bottom + window.scrollY;
        } else if (setDeleteOption && setEditOption) {
          topPosition = isNearBottom
            ? buttonRect.top + window.scrollY - dropdownHeight + 60
            : buttonRect.bottom + window.scrollY;
        } else if (setDeleteOption) {
          topPosition = isNearBottom
            ? buttonRect.top + window.scrollY - dropdownHeight + 90
            : buttonRect.bottom + window.scrollY;
        }

        setDropdownPosition({
          top: topPosition,
          left: buttonRect.left + window.scrollX - 110,
        });
      }

      setOpenDropdown(index);
    }
  };

  const handleRowClick = (item: any) => {
    if (type === "rfps") {
      if (item?.isDraft === true) {
        navigate(`/${rowNavigationPath}/${item.id}`);
      } else {
        navigate(`/${rowNavigationPath}/${item.id}`);
      }
    } else if (type === "proposal") {
      //navigate(`/${rowNavigationPath}/${item.id}`);
      setIsModalOpenItem && setIsModalOpenItem(item);
    } else if (type == "vendors") {
      navigate(`/${rowNavigationPath}/${item.id}`);
    } else if (type == "tendors") {
    }
  };

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {IsIcon && <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-lg font-bold">📊</span>
            </div>}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {setSearchQuery && (
              <div className="relative w-80">
                <MagnifyingGlass className="absolute size-5 left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Search RFPs..."
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            {setIsFilterModalOpen && (
              <button
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                onClick={() =>
                  setIsFilterModalOpen && setIsFilterModalOpen(true)
                }
              >
                <FilterIcon className="size-5 mr-2" /> Filter
              </button>
            )}
            {setIsSortModalOpen && (
              <button
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                onClick={() => setIsSortModalOpen && setIsSortModalOpen(true)}
              >
                <SortIcon className="size-5 mr-2" /> Sort
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div ref={tableContainerRef} className="overflow-auto max-h-[500px]">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200"
                >
                  {columnLabels[column]}
                </th>
              ))}
              {dots && (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(item)}
                  className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 group"
                >
                  {columns.map((col) => (
                    <td key={col} className={`px-6 py-4 text-sm`}>
                      {col === "status" ? (
                        <ShowStatus status={item[col]} type={type} />
                      ) : col === "tenderNumber" ? (
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-xs">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {item[col]}
                          </span>
                        </div>
                      ) : col === "rfpTitle" ? (
                        <div className="max-w-xs">
                          <div
                            className="font-medium text-gray-900 truncate text-sm"
                            title={item[col]}
                          >
                            {item[col]}
                          </div>
                        </div>
                      ) : col === "buyerName" ? (
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-600 font-semibold text-xs">
                              {item[col]?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <span className="text-gray-900 font-medium text-sm">
                            {item[col]}
                          </span>
                        </div>
                      ) : col === "estimatedContractValueLabel" ? (
                        <div className="text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {item[col]}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`text-gray-900 ${
                            col.includes("Value") ||
                            col.includes("value") ||
                            col.includes("amount") ||
                            col.includes("Amount")
                              ? "text-right"
                              : ""
                          }`}
                        >
                          {item[col]}
                        </span>
                      )}
                    </td>
                  ))}

                  <td
                    className="px-6 py-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {dots && item.status == 0 && (
                      <button
                        onClick={(e) => toggleDropdown(index, e)}
                        className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none"
                      >
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (dots ? 1 : 0)}
                  className="px-6 py-16 text-center"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-2">
                      <span className="text-blue-500 text-3xl">📊</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {NoDataTitle || "No RFPs Available"}
                      </h3>
                      <p className="text-gray-500 max-w-sm">
                        {NoDataDescription ||
                          "No RFP requests have been published yet. Create your first RFP to get started."}
                      </p>
                    </div>
                    
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openDropdown !== null && (
        <DropdownMenu
          position={dropdownPosition}
          data={items[openDropdown]}
          setOpenDropdown={setOpenDropdown}
          setEditOption={setEditOption}
          setBlockOption={setBlockOption}
          setDeleteOption={setDeleteOption}
        />
      )}

      {/* Pagination */}
      <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-semibold">{items.length}</span>{" "}
            results
          </div>
          <div className="flex items-center space-x-2">
            {currentPage > 1 && (
              <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <span className="mr-2">◀</span>
                Previous
              </button>
            )}
            <div className="flex items-center space-x-1">
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    page === currentPage
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            {currentPage < pages.length && (
              <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
                <span className="ml-2">▶</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
