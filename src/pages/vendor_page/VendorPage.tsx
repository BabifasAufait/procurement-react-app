import { useEffect, useState } from "react";
import Table from "../../components/basic_components/Table";
// import Cookies from "js-cookie";
import "./vendorPage.css";
import PageLoader from "../../components/basic_components/PageLoader";
// import { convertCurrencyLabel } from "../../utils/common";
import { getAllVendorsAsync } from "../../services/vendorService";
import { getUserPendingApprovalsAsync } from "../../services/flowService";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import { defaultFilter, vendor_sorting_fields } from "../../utils/constants";
import { IFilterDto } from "../../types/commonTypes";
import SortModal from "../../components/basic_components/SortModal";
import { VendorMainICon } from "../../utils/Icons";

function VendorPage() {
  const commonColumns = [
    "vendorCode",
    "organisationName",
    "ownerName",
    "status",
  ];
  const vendor_column_labels = {
    vendorCode: "ID",
    organisationName: "Vendor Name",
    ownerName: "Owner Name",
    status: "Status",
  };
  const [columns, setColumns] = useState(commonColumns);
  const [trigger, setTrigger] = useState(false);
  // const [hideDepartment,setHideDepartment]= useState(true);
  // const [hideStatus,setHideStatus]= useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  // const [filterModalOpen, setFilterModal] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [tableName, setTableName] = useState("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<any>(defaultFilter);
  const [showLoader] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("All vendors");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
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

  const getAllVendors = async (
    filterDto = filter,
    set: Set<number> | undefined = undefined
  ) => {
    try {
      //setShowLoader(true);
      let vendors_list: any = await getAllVendorsAsync(filterDto);
      //setShowLoader(false);
      setTotalCount(0);
      const modified_vendor_list: any[] = [];
      vendors_list.forEach((item: any) => {
        const tempItem = {
          ...item,
          ownerName: `${item?.firstName} ${item?.lastName}`,
        };
        if (item.status != 3) {
          if (set && set?.has(item.id)) modified_vendor_list.push(tempItem);
          else if (!set) modified_vendor_list.push(tempItem);
        }
      });
      setVendors(modified_vendor_list);
      setTrigger(false);
      return modified_vendor_list;
    } catch (err) {}
  };

  async function setupTab(tab: string) {
    if (statusFilter != tab) {
      let filterdata = filter;

      if (tab == "All vendors") {
        setColumns(commonColumns);
        // setHideDepartment(true);
        // setHideStatus(false)
        // filterdata = { ...filterdata, fields: [{ columnName: "status", operator: "!=", value: 3 }] }
      } else if (tab == "Assigned") {
        setColumns(commonColumns);
        const vendorIds: Set<number> = new Set();
        const all_pendig_with_user: any[] =
          await getUserPendingApprovalsAsync();
        all_pendig_with_user.forEach((item) => {
          item.vendorId && vendorIds.add(item.vendorId);
        });
        //filterdata = { ...filterdata, fields: [{ columnName: "status", operator: "!=", value: "draft" }, { columnName: "assigned_capex", value: true }] }
        await getAllVendors(filterdata, vendorIds);
        setTableName(tab);
        setStatusFilter(tab);
        return;
      } else {
        //setColumns(columns.filter(x=>x!="capexId"));
        // setHideDepartment(false);
        // setHideStatus(true)
        // filterdata = { ...filterdata, fields: [{ columnName: "status", operator: "=", value: "draft" }, { columnName: "createdBy", value: Cookies.get("userId") as string }] }
      }
      setTableName(tab);
      setFilter(filterdata);
      getAllVendors(filterdata);
      setStatusFilter(tab);
    }
  }

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const handleSearch = async () => {
    const updatedFilter: IFilterDto = {
      ...filter,
      globalSearch: searchQuery,
    };
    await getAllVendors(updatedFilter);
    console.log(searchQuery, "searchquery after fetch");
  };

  useEffect(() => {
    getAllVendors();
  }, [filter, trigger]);

  const tabs = ["All vendors", "Assigned"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <CommonTitleCard />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!showLoader ? (
          <>
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-[#1365AA] rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-bold"><VendorMainICon/></span>
                  </div>
                  <div>
                    <h1 className="text-heading-2">Vendors</h1>
                    <p className="text-body-small text-muted mt-1">
                      Manage your vendor partners
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <span className="text-button text-success">
                      {vendors.length} Total Vendors
                    </span>
                  </div>
                  {/* <CreateButton name="Create Vendor" onClick={onCreateRequest} /> */}
                </div>
              </div>
            </div>
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center space-x-8">
                {tabs.map((tab, index) => (
                  <div key={tab} className="flex items-center">
                    <button
                      onClick={() => setupTab(tab)}
                      className={`relative px-6 py-3 text-button rounded-lg transition-all duration-200 ${
                        statusFilter === tab
                          ? "bg-gradient-to-r from-blue-400 to-[#1365AA] !text-white shadow-lg transform -translate-y-0.5"
                          : "text-muted hover:text-slate-900 hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                      {statusFilter === tab && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-emerald-500"></div>
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
                title={tableName || "All vendors"}
                subtitle={"Manage and view all your vendors"}
                setIsSortModalOpen={setIsSortModalOpen}
                columns={columns}
                items={vendors || []}
                columnLabels={vendor_column_labels}
                setSearchQuery={setSearchQuery}
                totalCount={totalCount}
                type="vendors"
                rowNavigationPath="vendors"
                trigger={() => setTrigger(true)}
                NoDataTitle = {"No Vendors are Available"}
                IsIcon={false}
              />
            </div>

            {/* Modals */}
            {isSortModalOpen && (
              <SortModal
                filter={filter}
                columns={vendor_sorting_fields}
                setFilter={setFilter}
                setIsSortModalOpen={setIsSortModalOpen}
              />
            )}
          </>
        ) : (
          <PageLoader />
        )}
      </div>
    </div>
  );
}

export default VendorPage;
