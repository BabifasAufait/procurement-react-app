import { useEffect, useState } from "react";
import Table from "../../components/basic_components/Table";
import { IFilterDto } from "../../types/commonTypes";
// import Cookies from "js-cookie";
import SortModal from "../../components/basic_components/SortModal";
import { rfp_column_labels, capex_sorting_fields } from "../../utils/constants";
import "./vendorPage.css";
import CreateButton from "../../components/buttons/CreateButton";
import PageLoader from "../../components/basic_components/PageLoader";
// import { convertCurrencyLabel } from "../../utils/common";
import { useNavigate } from "react-router-dom";
import { getAllRfpsByFilterAsync } from "../../services/rfpService";
import { getAllVendorsAsync } from "../../services/vendorService";

const tempfilter = {
  nameFilter:""
}

function VendorPage() {
  const commonColumns=['vendorCode', 'organisationName', 'ownerName', "statusName"]
  const vendor_column_labels = {
    vendorCode: 'ID',
    organisationName: 'Vendor Name',
    ownerName: 'Owner Name',
    statusName: 'Status',
};
  const [columns,setColumns] = useState(commonColumns);
  const [trigger, setTrigger] = useState(false);
  // const [hideDepartment,setHideDepartment]= useState(true);
  // const [hideStatus,setHideStatus]= useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  // const [filterModalOpen, setFilterModal] = useState<boolean>(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [tableName, setTableName] = useState("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [filter, setFilter] = useState<any>(tempfilter);

  const [showLoader] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("All requests");
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

 

  const getAllVendors = async (filterDto = filter) => {
    try {
      //setShowLoader(true);
      let vendors_list:any = await getAllVendorsAsync(filterDto)
      //setShowLoader(false);
      setTotalCount(0)
      const modified_vendor_list = vendors_list.map((item:any)=>({...item,ownerName:`${item?.firstName} ${item?.lastName}`}))
      setVendors(modified_vendor_list);
      setTrigger(false);
    } catch (err) {
    }
  };

  async function setupTab(tab: string) {
    if (statusFilter != tab) {
      let filterdata = filter;

      if (tab == "All requests") {
        setColumns(commonColumns);
        // setHideDepartment(true);
        // setHideStatus(false)
        //filterdata = { ...filterdata, fields: [{ columnName: "status", operator: "!=", value: "draft" }, { columnName: "requestingDepartmentId", value: Cookies.get("departmentId") as string }] }
      } else if (tab == "My requests") {
        setColumns(commonColumns);
        // setHideDepartment(false);
        // setHideStatus(false)
        // filterdata = { ...filterdata, fields: [{ columnName: "status", operator: "!=", value: "draft" }, { columnName: "createdBy", value: Cookies.get("userId") as string }] }
      } else if (tab == "Assigned") {
        setColumns(commonColumns);
        // setHideDepartment(false);
        // setHideStatus(false)
        // filterdata = { ...filterdata, fields: [{ columnName: "status", operator: "!=", value: "draft" }, { columnName: "assigned_capex", value: true }] }
      } else {
        setColumns(columns.filter(x=>x!="capexId"));
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
    handleSearch()
  }, [searchQuery])

  const handleSearch = async () => {
    const updatedFilter = {
      ...filter,
      nameFilter: searchQuery
    };
    await getAllVendors(updatedFilter);
    console.log(searchQuery, "searchquery after fetch")
  };

  useEffect(() => {
    getAllVendors();
  }, [filter, trigger]);

  const tabs = ["All requests", "My requests", "Draft requests"];

  return (
    <div className="desktop-wide:flex desktop-wide:justify-center">
      <div className="pt-[24px] px-[32px] h-full">
        {!showLoader ? <>
          <div className="flex items-center justify-between">
            <div className="mb-2 text-xl font-bold">Requests</div>
            <div>
              {/* <CreateButton name="Create request" onClick={onCreateRequest} /> */}
              
            </div>

          </div>
          <div className="pt-[24px] flex justify-start mb-[16px]">
            {tabs.map((tab, index) => (
              <div className="flex items-center h-[37px]" key={tab}>
                <div
                  onClick={() => setupTab(tab)}
                  className={`relative h-full w-full text-sm text-start cursor-pointer ${statusFilter === tab
                    ? "text-customBlue"
                    : "text-black hover:text-customBlue"
                    }`}
                >
                  {tab}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-[3px] rounded-t-[10px] ${statusFilter === tab
                      ? "bg-customBlue"
                      : "bg-transparent group-hover:bg-customBlue"
                      }`}
                  ></span>
                </div>
                {index !== tabs.length - 1 && (
                  <span className="mx-[12px] h-[37px] text-gray-400">|</span>
                )}
              </div>
            ))}
          </div>


          <div className="ml-[10px]">
            <Table filter={filter} setFilter={setFilter} title={tableName || "Vendors"} setIsSortModalOpen={setIsSortModalOpen} columns={columns} items={vendors} columnLabels={vendor_column_labels} setIsFilterModalOpen={()=>{}} setSearchQuery={setSearchQuery} totalCount={totalCount} type="vendors" rowNavigationPath="vendors" trigger={() => setTrigger(true)} />
            {isSortModalOpen && <SortModal filter={filter} columns={capex_sorting_fields} setFilter={setFilter} setIsSortModalOpen={setIsSortModalOpen} />}
          </div></> : <PageLoader />}
      </div>
    </div>
  );
}

export default VendorPage;
