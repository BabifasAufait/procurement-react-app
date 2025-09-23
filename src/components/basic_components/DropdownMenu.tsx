import React, { useEffect, useRef } from "react";

interface IDot {
  setEditOption?: (data: any) => void;
  setBlockOption?: (data: any) => void;
  setDeleteOption?: (data: any) => void;
}

const DropdownMenu: React.FC<
  {
    position: { top: number; left: number };
    data: any;
    setOpenDropdown: (index: number | null) => void;
  } & IDot
> = ({
  position,
  data,
  setOpenDropdown,
  setEditOption,
  setBlockOption,
  setDeleteOption,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white border shadow-md rounded w-32"
      style={{ top: position.top, left: position.left, zIndex: 100 }}
    >
      {setEditOption && (
        <button
          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          onClick={() => setEditOption(data)}
        >
          Edit
        </button>
      )}
      {setBlockOption && (
        <button
          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          onClick={() => setBlockOption(data)}
        >
          {data.isActive ? "Block" : "Unblock"}
        </button>
      )}
      {setDeleteOption && (
        <button
          className="w-full text-left px-4 py-2 hover:bg-red-100 text-sm text-red-600"
          onClick={() => setDeleteOption(data)}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default DropdownMenu;
