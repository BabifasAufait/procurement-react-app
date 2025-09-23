import React, { useState } from "react";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import Table from "../../components/basic_components/Table";
import {
  defaultFilter,
  upcoming_tendor_sorting_fields,
} from "../../utils/constants";
import SortModal from "../../components/basic_components/SortModal";
import CreateButton from "../../components/buttons/CreateButton";
import TendorModal from "./TendorModal";
import { Modal as AntdModal, Button } from "antd";

export interface IUTendors {
  id: number;
  title: string;
  description: string;
  publishingDate: string;
  categoryID: {
    id: number;
    value: string;
    label: string;
  }[];
  status?: number;
}

type VendorColumnKeys =
  | "title"
  | "description"
  | "publishingDate"
  | "categoryID";

const UpcomingTendors = () => {
  const [tableName, setTableName] = useState("");
  const columns = [
    "title",
    "description",
    "publishingDate",
    "categoryID",
    "actions",
  ];
  const vendor_column_labels: Record<VendorColumnKeys, string> = {
    title: "Title",
    description: "Description",
    publishingDate: "Tender Publishing Date",
    categoryID: "Category ID",
  };

  const [totalTendorrequest, setTotalTendorrequest] = useState<IUTendors[]>([]);
  const [tendorlist, setTendorlist] = useState<IUTendors[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<any>(defaultFilter);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [istendorDeleteModalOpen, setTendorDeleteModalOpen] = useState(false);

  // ✅ Added state to store selected tender for deletion
  const [selectedTender, setSelectedTender] = useState<IUTendors | null>(null);

  const [tendorData, setTendorData] = useState<IUTendors>({
    id: 0,
    title: "",
    description: "",
    publishingDate: "",
    categoryID: [],
    status: 0,
  });

  const handleSubmit = () => {
    const Validatefields = vendor_column_labels;

    (Object.keys(Validatefields) as VendorColumnKeys[]).forEach((key) => {
      const value = tendorData[key];
      const label = Validatefields[key];

      if (
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0)
      ) {
        alert(`Please fill the ${label}`);
        throw new Error("Validation failed");
      }
    });

    const newTendor = { ...tendorData, id: Date.now() }; // Assign unique id
    setTendorlist((prevList) => [...prevList, newTendor]);
    setTotalCount((prev) => prev + 1);
    setCreateModalOpen(false);
    setTendorData({
      id: 0,
      title: "",
      description: "",
      publishingDate: "",
      categoryID: [],
      status: 0,
    });
  };

  const onCreateRequest = () => {
    setCreateModalOpen(true);
  };

  /**
   * Open delete confirmation modal and store selected tender
   */
  const handleDeleteTender = (item: IUTendors) => {
    setSelectedTender(item);
    setTendorDeleteModalOpen(true);
  };

  /**
   * Confirm delete after user clicks "Delete"
   */
  const handleConfirmDeleteTender = () => {
    if (selectedTender) {
      setTendorlist((prevList) =>
        prevList.filter((tendor) => tendor.id !== selectedTender.id)
      );
      setTotalCount((prev) => prev - 1);
    }
    setSelectedTender(null);
    setTendorDeleteModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <CommonTitleCard />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-[#1365AA] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">⏳</span>
              </div>
              <div>
                <h1 className="text-heading-2">Upcoming Tenders</h1>
                <p className="text-body-small text-muted mt-1">
                  Manage your upcoming tender partners
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CreateButton name="Create Tendor" onClick={onCreateRequest} />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <Table
            title={tableName || ""}
            columns={columns}
            columnLabels={vendor_column_labels}
            subtitle={""}
            items={tendorlist || []}
            totalCount={totalCount}
            setSearchQuery={setSearchQuery}
            setFilter={setFilter}
            setIsSortModalOpen={setIsSortModalOpen}
            type="tendors"
            rowNavigationPath="tendors"
            NoDataTitle={"No Upcoming Tendors Available"}
            NoDataDescription={
              "No upcoming tenders are available yet. Create upcoming tenders as per your requirement."
            }
            IsButton={false}
            IsIcon={false}
            dots={true}
            setDeleteOption={(item: IUTendors) => handleDeleteTender(item)}
          />
        </div>

        {/* Sort Modal */}
        {isSortModalOpen && (
          <SortModal
            filter={filter}
            columns={upcoming_tendor_sorting_fields}
            setFilter={setFilter}
            setIsSortModalOpen={setIsSortModalOpen}
          />
        )}

        {/* Create Tender Modal */}
        <TendorModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          tendorData={tendorData}
          setTendorData={setTendorData}
          onSubmit={handleSubmit}
        />

        {/* Delete Confirmation Modal */}
        <AntdModal
          title="Confirm Delete"
          open={istendorDeleteModalOpen}
          onCancel={() => setTendorDeleteModalOpen(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setTendorDeleteModalOpen(false)}
            >
              Cancel
            </Button>,
            <Button
              key="confirm"
              type="primary"
              danger
              onClick={handleConfirmDeleteTender}
            >
              Delete
            </Button>,
          ]}
        >
          <p>Are you sure you want to delete this tender?</p>
        </AntdModal>
      </div>
    </div>
  );
};

export default UpcomingTendors;
