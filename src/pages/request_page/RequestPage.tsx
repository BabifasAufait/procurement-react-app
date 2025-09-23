import { useEffect, useState } from "react";
import { Button, notification } from "antd";
import { Modal as AntdModal } from "antd";
import Table from "../../components/basic_components/Table";
import { IFilterDto } from "../../types/commonTypes";
// import Cookies from "js-cookie";
import SortModal from "../../components/basic_components/SortModal";
import { rfp_column_labels, rfp_sorting_fields } from "../../utils/constants";
import "./requestPage.css";
import CreateButton from "../../components/buttons/CreateButton";
import PageLoader from "../../components/basic_components/PageLoader";
// import { convertCurrencyLabel } from "../../utils/common";
import { useNavigate } from "react-router-dom";
import {
  createOrUpdateRfpAsync,
  deleteRfpByIdAsync,
  getAllRfpsByFilterAsync,
} from "../../services/rfpService";
import { convertCurrencyLabel, getUserCredentials } from "../../utils/common";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import { IRfp } from "../../types/rfpTypes";
import RfpFilterModal from "../../components/rfp_request/RfpFilterModal";

const tempfilter = {
  fields: [],
  pageNo: 0,
  pageSize: 0,
  sortColumn: "CreatedAt",
  sortDirection: "DESC",
};

function RequestPage() {
  const commonColumns = [
    "tenderNumber",
    "rfpTitle",
    "buyerName",
    "estimatedContractValueLabel",
    "status",
  ];
  const [columns, setColumns] = useState(commonColumns);
  const [trigger, setTrigger] = useState(false);
  // const [hideDepartment,setHideDepartment]= useState(true);
  // const [hideStatus,setHideStatus]= useState(false);
  const [rfpRequests, setRfpRequests] = useState<any[]>([]);
  // const [filterModalOpen, setFilterModal] = useState<boolean>(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [tableName, setTableName] = useState("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [defaultFilter, setDefaultFilter] = useState<IFilterDto>(tempfilter);
  const [filter, setFilter] = useState<IFilterDto>(defaultFilter);
  const [showLoader] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("All RFPs");
  const [, setSelectedRfp] = useState<IRfp>();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "block";
    rfp: IRfp;
  } | null>(null);
  const [filterModalOpen, setFilterModal] = useState<boolean>(false);
  const navigate = useNavigate();

  // const requestStatuses = [
  //   { label: "Approved", value: "approved" },
  //   { label: "Rejected", value: "rejected" },
  //   { label: "Pending", value: "pending" },
  //   { label: "Under clarification", value: "under_clarification" },
  // ]

  // const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  // useEffect(() => {
  //   if (isModalOpen) {
  //     document.body.classList.add("modal-open"); // Disable background scrolling
  //   }
  //   return () => {
  //     document.body.classList.remove("modal-open"); // Cleanup when modal closes
  //   };
  // }, [isModalOpen]);

  const onCreateRequest = () => {
    navigate("/rfps/create-rfp");
  };

  const getRfpRequestFilter = async (filterDto: IFilterDto = filter) => {
    try {
      //setShowLoader(true);
      let capex_request_responese: any = await getAllRfpsByFilterAsync(
        filterDto
      );
      //setShowLoader(false);
      setTotalCount(0);
      let data: any = capex_request_responese.map((r: any) => ({
        ...r,
        estimatedContractValueLabel: `${convertCurrencyLabel(
          r.rfpCurrency as string
        )}${r.estimatedContractValue?.toFixed(2)}`,
      }));
      setRfpRequests(data);
      setTrigger(false);
    } catch (err) {
      console.log(err);
    }
  };

  async function setupTab(tab: string) {
    if (statusFilter != tab) {
      let filterdata = filter;

      if (tab == "All RFPs") {
        setColumns(commonColumns);
        // setHideDepartment(true);
        // setHideStatus(false)
        filterdata = { ...filterdata, fields: [] };
      } else if (tab == "My RFPs") {
        setColumns(commonColumns);
        // setHideDepartment(false);
        // setHideStatus(false)
        filterdata = {
          ...filterdata,
          fields: [
            {
              columnName: "CreatedBy",
              value: Number(getUserCredentials().userId),
            },
          ],
        };
      } else if (tab == "Assigned") {
        setColumns(commonColumns);
        // setHideDepartment(false);
        // setHideStatus(false)
        filterdata = {
          ...filterdata,
          fields: [{ columnName: "assigned_rfps", value: true }],
        };
      } else {
        return;
        //setColumns(columns.filter(x=>x!="capexId"));
        // setHideDepartment(false);
        // setHideStatus(true)
        filterdata = {
          ...filterdata,
          fields: [
            { columnName: "status", operator: "=", value: "draft" },
            {
              columnName: "CreatedBy",
              value: Number(getUserCredentials().userId),
            },
          ],
        };
      }
      setDefaultFilter(filterdata);
      setTableName(tab);
      setFilter(filterdata);
      getRfpRequestFilter(filterdata);
      setStatusFilter(tab);
    }
  }

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const handleSearch = async () => {
    const updatedFilter = {
      ...filter,
      globalSearch: searchQuery,
    };
    await getRfpRequestFilter(updatedFilter);
    console.log(searchQuery, "searchquery after fetch");
  };

  const handleThreeDots = (type: "edit" | "delete" | "block", rfp: IRfp) => {
    console.log(rfp);
    setSelectedRfp(rfp);
    if (type === "edit") {
      navigate(`/rfps/edit-rfp/${rfp.id}`);
    } else {
      setConfirmAction({ type, rfp });
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction?.type === "delete") {
        console.log("here delete");
        const response = await deleteRfpByIdAsync(
          confirmAction.rfp.id as number
        );
        if (response) {
          setTrigger(true);
        }
      } else if (confirmAction?.type === "block") {
        // const formData = new FormData();
        // formData.append("id", confirmAction.user.id as string);
        // formData.append("isActive", (!confirmAction.user.isActive).toString());
        const formData = {
          id: confirmAction.rfp.id,
          status: "hold", // setting RFP status to "hold"
        };
        const response = await createOrUpdateRfpAsync(formData);
        if (response) {
          setTrigger(true);
        }
      }
      notification.success({
        message: `User ${
          confirmAction?.type == "delete" ? "deletion" : "action"
        } successfull`,
      });
    } catch (error: any) {
      notification.error({
        message: `${confirmAction?.type} error`,
        description: error.message,
      });
    }

    setIsConfirmModalOpen(false);
  };

  useEffect(() => {
    getRfpRequestFilter();
  }, [filter, trigger]);

  const tabs = ["All RFPs", "My RFPs", "Assigned", "Draft RFPs"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <CommonTitleCard />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!showLoader ? (
          <>
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-bold">📋</span>
                  </div>
                  <div>
                    <h1 className="text-heading-2">RFPs</h1>
                    <p className="text-body-small text-muted mt-1">
                      Manage your Request for Proposals
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <span className="text-button text-accent">
                      {rfpRequests.length} Total RFPs
                    </span>
                  </div>
                  <CreateButton name="Create RFP" onClick={onCreateRequest} />
                </div>
              </div>
            </div>
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center space-x-8">
                {tabs.map((tab, index) => (
                  <div key={tab} className="flex items-center">
                    <button
                      onClick={() => setupTab(tab)}
                      className={`relative px-6 py-3 text-button rounded-lg transition-all duration-200 ${
                        statusFilter === tab
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 !text-white shadow-lg transform -translate-y-0.5"
                          : "text-muted hover:text-slate-900 hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                      {statusFilter === tab && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500"></div>
                      )}
                    </button>
                    {index !== tabs.length - 1 && (
                      <div className="w-px h-6 bg-gray-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <Table
                filter={filter}
                setFilter={setFilter}
                title={tableName || "All requests"}
                subtitle={"Manage and view your RFP requests"}
                setIsSortModalOpen={setIsSortModalOpen}
                columns={columns}
                IsButton={true}
                items={rfpRequests || []}
                columnLabels={rfp_column_labels}
                setIsFilterModalOpen={setFilterModal}
                setSearchQuery={setSearchQuery}
                totalCount={totalCount}
                type="rfps"
                rowNavigationPath="rfps"
                trigger={() => setTrigger(true)}
                dots
                setEditOption={(user) => handleThreeDots("edit", user)}
                setDeleteOption={(user) => handleThreeDots("delete", user)}
                setBlockOption={(user) => handleThreeDots("block", user)}
                IsIcon={true}
              />
            </div>

            {/* Modals */}
            {filterModalOpen && (
              <RfpFilterModal
                filter={filter}
                defaultFilter={defaultFilter}
                setFilter={setFilter}
                setIsFilterModalOpen={setFilterModal}
                status={[
                  { label: "Open", value: true },
                  { label: "Closed", value: false },
                ]}
              />
            )}
            {isSortModalOpen && (
              <SortModal
                filter={filter}
                columns={rfp_sorting_fields}
                setFilter={setFilter}
                setIsSortModalOpen={setIsSortModalOpen}
              />
            )}

            <AntdModal
              title={
                confirmAction?.type === "delete"
                  ? "Confirm Delete"
                  : "Confirm Block"
              }
              open={isConfirmModalOpen}
              onCancel={() => setIsConfirmModalOpen(false)}
              footer={[
                <Button
                  key="cancel"
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Cancel
                </Button>,
                <Button
                  key="confirm"
                  type="primary"
                  danger={confirmAction?.type === "delete"}
                  onClick={handleConfirmAction}
                >
                  {confirmAction?.type === "delete" ? "Delete" : "Block"}
                </Button>,
              ]}
            >
              <p>
                Are you sure you want to{" "}
                {confirmAction?.type === "delete" ? "delete" : "block"} this
                rfp?
              </p>
            </AntdModal>
          </>
        ) : (
          <PageLoader />
        )}
      </div>
    </div>
  );
}

export default RequestPage;
