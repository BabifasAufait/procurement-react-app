import React, { useEffect, useState } from "react";
import DateTimePicker from "../../components/basic_components/date_time_picker/DateTimePicker";
import TextField from "../../components/basic_components/TextField";
import { Select } from "antd";
import { getAllCategoriesAsync } from "../../services/categoryService";

interface CategoryType {
  id: number;
  value: string;
  label: string;
}

interface TendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tendorData: {
    id: number;
    title: string;
    description: string;
    publishingDate: string;
    categoryID: CategoryType[];
  };
  setTendorData: React.Dispatch<
    React.SetStateAction<{
      id: number;
      title: string;
      description: string;
      publishingDate: string;
      categoryID: CategoryType[];
    }>
  >;
  onSubmit: () => void;
}

const TendorModal: React.FC<TendorModalProps> = ({
  isOpen,
  onClose,
  tendorData,
  setTendorData,
  onSubmit,
}) => {
  const [categoryMaster, setCategoryMaster] = useState<CategoryType[]>([]);

  useEffect(() => {
    getAllCategoriesFromMaster();
  }, []);

  const getAllCategoriesFromMaster = async () => {
    try {
      const categories = await getAllCategoriesAsync();
      const categoriesValues = categories.map((category: any) => ({
        label: category.name,
        value: category.name,
        id: category.id,
      }));
      setCategoryMaster(categoriesValues);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategoriesOptions = (val: string[]) => {
    const selected = categoryMaster.filter((item) => val.includes(item.value));
    setTendorData((prev) => ({
      ...prev,
      categoryID: selected,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto p-6 z-50">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Create Tender</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Form Fields */}
        <div className="mt-4 space-y-4 bg-gray-50 rounded-xl border border-gray-200 p-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Title <span className="text-red-500">*</span>
            </label>
            <TextField
              required={true}
              id="UptendorTitle"
              field="Title"
              value={tendorData.title}
              setValue={(val: string) =>
                setTendorData({ ...tendorData, title: val })
              }
              placeholder="Enter tender title"
              type="text"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Description <span className="text-red-500">*</span>
            </label>
            <TextField
              id="UptendorDescription"
              field="Description"
              value={tendorData.description}
              setValue={(val: string) =>
                setTendorData({ ...tendorData, description: val })
              }
              placeholder="Enter description"
              style="min-h-[50px]"
              type="textarea"
              width="w-full"
              required={true}
            />
          </div>

          {/* Publishing Date */}
          <DateTimePicker
            label="Publishing Date"
            value={tendorData.publishingDate}
            setValue={(val) =>
              setTendorData({
                ...tendorData,
                publishingDate: val,
              })
            }
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              className="h-[41px]"
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Select category"
              value={tendorData.categoryID.map((cat) => cat.value)}
              onChange={(val) => handleCategoriesOptions(val)}
              options={categoryMaster}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default TendorModal;
