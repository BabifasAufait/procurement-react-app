import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterIcon, MagnifyingGlass, SortIcon } from '../../utils/Icons';
import ShowStatus from '../buttons/ShowStatus';
import { IFilterDto } from '../../types/commonTypes';
import DropdownMenu from './DropdownMenu';
import { EllipsisVerticalIcon } from 'lucide-react';

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
  filter: IFilterDto;
  setFilter: React.Dispatch<React.SetStateAction<IFilterDto>>;
  setIsFilterModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSortModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setIsModalOpenItem?: React.Dispatch<React.SetStateAction<any>>;
  totalCount: number;
  rowNavigationPath?: string;
  type: "proposal" | "rfps" | "vendors";
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
  type,
}) => {
  const [pages, setPages] = useState<number[]>([]);
  const navigate = useNavigate();
  const currentPage = filter.pageNo ?? 1;
  const pageSize = filter.pageSize ?? 10;
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (totalCount > 0) {
      const pagesNeeded = Math.ceil(totalCount / pageSize);
      setPages(Array.from({ length: pagesNeeded }, (_, i) => i + 1));
    } else {
      setPages([]);
    }
  }, [totalCount, pageSize]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page !== currentPage) {
      setFilter((prev) => ({ ...prev, pageNo: page }));
    }
  };

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    const handleScroll = () => {
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
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
        const topPosition = isNearBottom
          ? buttonRect.top + window.scrollY - dropdownHeight + 40
          : buttonRect.bottom + window.scrollY;

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
    } else if(type == "vendors"){
      navigate(`/${rowNavigationPath}/${item.id}`);
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-md border w-full">
      <div className="bg-white p-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex space-x-2">
            <div className="relative w-[219px] h-[32px]">
              <MagnifyingGlass className="absolute w-6 h-6 left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-[5px] border rounded bg-[#EFF4F9] text-sm focus:outline-none"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className="px-3 py-2 w-[75px] h-[32px] flex text-xs items-center justify-center bg-[#EFF4F9] rounded hover:bg-blue-200"
              onClick={() => setIsFilterModalOpen && setIsFilterModalOpen(true)}
            >
              <FilterIcon className="size-6 mr-2" /> Filter
            </button>
            <button
              className="px-3 py-2 w-[75px] h-[32px] text-xs flex items-center justify-center bg-[#EFF4F9] rounded hover:bg-blue-200"
              onClick={() => setIsSortModalOpen && setIsSortModalOpen(true)}
            >
              <SortIcon className="size-6 mr-2" /> Sort
            </button>
          </div>
        </div>

        <div ref={tableContainerRef} className="overflow-auto max-h-[380px]">
          <table className="min-w-full border-collapse table-auto">
            <thead className="sticky top-0 bg-white z-5">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-4 py-2 border-b text-[12px] text-gray-600 text-left">
                    {columnLabels[column]}
                  </th>
                ))}
                {dots && <th className="px-2 py-2 border-b"></th>}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(item)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-2 border-b text-sm">
                        {col === 'isOpen' ? <ShowStatus status={item[col] ? "open" : "closed"} type={type} /> : item[col]}
                      </td>
                    ))}
                    {dots && (
                      <td className="px-6 py-2 border-b text-xs" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => toggleDropdown(index, e)} className="focus:outline-none">
                          <EllipsisVerticalIcon className="w-4 h-4 stroke-gray-600" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + (dots ? 1 : 0)} className="px-4 py-2 border-b text-center">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

      <div className="flex justify-end items-center mt-4 px-3 pb-3">
        {currentPage > 1 && (
          <button
            className="px-3 py-2 text-xs border bg-white text-center hover:bg-blue-400 rounded-l-md"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ◀
          </button>
        )}
        <div className="flex overflow-x-auto">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-xs ${page === currentPage ? 'bg-blue-400 text-white rounded-md' : 'bg-white hover:bg-blue-400 hover:rounded-md'} border-r`}
            >
              {page}
            </button>
          ))}
        </div>
        {currentPage < pages.length && (
          <button
            className="px-3 py-2 text-xs border bg-white text-center hover:bg-blue-400 rounded-r-md"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            ▶
          </button>
        )}
      </div>


    </div>
  );
};

export default Table;