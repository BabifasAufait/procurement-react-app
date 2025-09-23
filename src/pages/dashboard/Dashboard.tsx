import { useEffect, useState, useCallback } from "react";
import Table from "../../components/basic_components/Table";
import BudgetCard from "../../components/dashboard/BudgetCard";
import StatusBar from "../../components/dashboard/StatusBar";
import TitleCard from "../../components/dashboard/TitleCard";
import { IFilterDto, statusDataProp } from "../../types/commonTypes";
import RequestCard from "../../components/dashboard/RequestCard";
import { TickIcon } from "../../utils/Icons";
import PageLoader from "../../components/basic_components/PageLoader";
import { notification } from "antd";
import { convertCurrencyLabel } from "../../utils/common";
import { rfp_column_labels } from "../../utils/constants";
import { getAllRfpsByFilterAsync } from "../../services/rfpService";

const defaultFilter: IFilterDto = {
  fields: [{
    columnName: "status",
    value: 5
  }],
  sortColumn: "CreatedAt",
  sortDirection: "DESC",
  pageNo: 1,
  pageSize: 10
}

function Dashboard() {
  const commonColumns = ['tenderNumber', 'rfpTitle', 'buyerName', 'estimatedContractValueLabel', 'status']

  const [requestStatus, setRequestStatus] = useState([8, 15, 12]);

  // State definitions
  const [dashboardData, setDashboardData] = useState({
    newRequests: [] as any[],
    // requestStatus: [0, 0, 0],
    rfpRequests: [
      {
        tenderNumber: "RFP-2024-001",
        rfpTitle: "Office Equipment Procurement",
        buyerName: "John Smith",
        estimatedContractValueLabel: "$25,000.00",
        status: 1
      },
      {
        tenderNumber: "RFP-2024-002", 
        rfpTitle: "IT Infrastructure Upgrade",
        buyerName: "Sarah Johnson",
        estimatedContractValueLabel: "$45,000.00",
        status: 2
      },
      {
        tenderNumber: "RFP-2024-003",
        rfpTitle: "Marketing Services Contract",
        buyerName: "Mike Davis",
        estimatedContractValueLabel: "$15,000.00",
        status: 1
      }
    ] as any[],
    totalCount: 3,
  });

  const [budgetDetails, setBudgetDetails] = useState<any>({
    years: ['2020', '2021', '2022', '2023', '2024'],
    budgets: [12000, 15000, 18000, 22000, 25000],
    spend: [10000, 13000, 16000, 19000, 21000],
  });

  const [, setTrigger] = useState(false);
  const [, setIsSortModalOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false)
  const [searchQuery, setSearchQuery] = useState("");


  const [filter, setFilter] = useState<IFilterDto>(defaultFilter);

  const [statusData, setStatusData] = useState<statusDataProp[]>([
    {
      icon: "🎯",
      label: "Closed RFPs",
      value: 8,
      color: "bg-green-500/30",
      textColor: "text-green-900",
    },
    {
      icon: "📊",
      label: "Open RFPs",
      value: 15,
      color: "bg-blue-500/30",
      textColor: "text-blue-900"
    },
    {
      icon: "⚡",
      label: "Under Approval",
      value: 12,
      color: "bg-yellow-500/30",
      textColor: "text-yellow-900",
    }
  ]);


  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setTrigger(false);
      setShowLoader(true);
      const rfpResponse = await getAllRfpsByFilterAsync();
      const requests = rfpResponse.map((r: any) => ({ ...r, bidValueLabel: `${convertCurrencyLabel(r.rfpCurrency as string)}${r.bidValue?.toFixed(2)}` }));
      const statusCounts = [0, 0, 0];
      const approvedRequests: any[] = [];

      // Process requests and count statuses
      requests.forEach((request: any) => {
        switch (request.status) {
          case 6:
            statusCounts[0]++;
            if (approvedRequests) {
              approvedRequests.push(request as any);
            }
            break;
          case 5:
            statusCounts[1]++;
            break;
          default:
            statusCounts[2]++;
            break;
        }
      });

      // Update status data
      setStatusData([
        {
          icon: <TickIcon className="w-5 h-5" />,
          label: "Closed RFPs",
          value: statusCounts[0],
          color: "bg-green-500/30",
          textColor: "text-green-900",
        },
        {
          icon: "!",
          label: "Open RFPs",
          value: statusCounts[1],
          color: "bg-blue-500/30",
          textColor: "text-blue-900"
        },
        {
          icon: "!",
          label: "Under Approval",
          value: statusCounts[2],
          color: "bg-yellow-500/30",
          textColor: "text-yellow-900",
        }
      ]);

      // Process budget data
      const budgetsByYear = approvedRequests.reduce((acc: { [key: string]: number }, budget: any) => {
        const year = budget.createdAt.slice(0, 4);
        acc[year] = (acc[year] || 0) + budget.estimatedContractValue;
        return acc;
      }, {});

      const years = Object.keys(budgetsByYear).sort();
      const spendByYear = years.reduce((acc: { [key: string]: number }, year) => {
        acc[year] = approvedRequests
          .filter((m: any) => m.closingDate?.slice(0, 4) === year)
          .reduce((sum: number, m: any) => sum + (m.bidValue || 0), 0);
        return acc;
      }, {});

      setBudgetDetails({
        years,
        budgets: years.map(year => budgetsByYear[year]),
        spend: years.map(year => spendByYear[year])
      });

      setRequestStatus(statusCounts);

      // Update status data with actual values
      setStatusData([
        {
          icon: <TickIcon className="w-5 h-5" />,
          label: "Closed RFPs",
          value: statusCounts[0] || 0,
          color: "bg-green-500/30",
          textColor: "text-green-900",
        },
        {
          icon: "!",
          label: "Open RFPs",
          value: statusCounts[1] || 0,
          color: "bg-blue-500/30",
          textColor: "text-blue-900"
        },
        {
          icon: "!",
          label: "Under Approval",
          value: statusCounts[2] || 0,
          color: "bg-yellow-500/30",
          textColor: "text-yellow-900",
        }
      ]);

      // Update dashboard data
      setDashboardData({
        newRequests: [],
        rfpRequests: approvedRequests,
        totalCount: statusCounts.reduce((a, b) => a + b, 0), // Total all requests
      });
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      notification.error({
        message: error.message
      })
    } finally {
      setShowLoader(false);
    }
  }, []);



  // Fetch capex requests with filter
  const getRfpRequestFilter = useCallback(async (filterData = filter) => {
    try {
      const response: any[] = await getAllRfpsByFilterAsync(filterData);
      const filtered_requests = response.map(r => ({ ...r, estimatedContractValueLabel: `${convertCurrencyLabel(r.rfpCurrency as string)}${r.estimatedContractValue?.toFixed(2)}` }))
      setDashboardData(prev => ({
        ...prev,
        totalCount: 20,
        rfpRequests: filtered_requests
      }));
    } catch (error) {
      console.error("Error fetching filtered capex requests:", error);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const updatedFilter = {
      ...filter,
      globalSearch: searchQuery
    };
    setFilter(updatedFilter);
  }, [searchQuery]);

  useEffect(() => {
    getRfpRequestFilter(filter);
  }, [filter]);


  return (
    <div className="min-h-screen bg-slate-50">
      {showLoader ? (
        <PageLoader />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Header Section */}
          <div className="mb-6">
            <TitleCard trigger={() => setTrigger(true)} />
          </div>

          {/* Main Dashboard Layout */}
          <div className="space-y-6">
            {/* Top Section - Status Cards and Key Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Status Cards - Takes 3/4 width */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatusBar statuses={statusData || []} />
                </div>
              </div>
              
              {/* Quick Stats - Takes 1/4 width */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg border-0 p-4 h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-base font-bold">📊</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-heading-4">Overview</h3>
                        <p className="text-body-small text-muted">Key metrics</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="text-xl font-bold text-slate-900 mb-1">{requestStatus.reduce((a, b) => a + b, 0)}</div>
                        <div className="text-caption">Total RFPs</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                          <div className="text-base font-bold text-emerald-600 mb-1">{requestStatus[0] || 0}</div>
                          <div className="text-caption">Completed</div>
                        </div>
                        <div className="text-center p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                          <div className="text-base font-bold text-amber-600 mb-1">{requestStatus[2] || 0}</div>
                          <div className="text-caption">In Progress</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section - Charts and Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Budget Chart - Takes 2/3 width */}
              <div className="xl:col-span-2 relative">
                <BudgetCard budgetDetails={budgetDetails} />
              </div>
              
              {/* Request Status Chart - Takes 1/3 width */}
              <div className="xl:col-span-1">
                <RequestCard
                  labels={['Closed', 'Open', 'Under Approval']}
                  data={requestStatus || [0, 0, 0]}
                  colors={['#10B981', '#3B82F6', '#F59E0B']}
                />
              </div>
            </div>

            {/* Bottom Section - Main Content and Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              {/* RFPs Table - Takes 3/4 width */}
              <div className="xl:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-slate-50 to-gray-50 rounded-full -translate-y-20 translate-x-20"></div>
                  <div className="relative z-10">
                    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg font-bold">📋</span>
                          </div>
                          <div>
                            <h3 className="text-heading-3">Published RFPs</h3>
                            <p className="text-body-small text-muted">Manage and view your RFP requests</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Table 
                      filter={filter} 
                      setFilter={setFilter} 
                      title={""} 
                      setIsSortModalOpen={setIsSortModalOpen} 
                      columns={commonColumns} 
                      items={dashboardData.rfpRequests || []} 
                      columnLabels={rfp_column_labels} 
                      setIsFilterModalOpen={() => { }} 
                      setSearchQuery={setSearchQuery} 
                      totalCount={20} 
                      type="rfps" 
                      rowNavigationPath="rfps" 
                      trigger={() => setTrigger(true)}
                      subtitle={"Manage and view your RFP requests"}
                      IsButton={true}
                      IsIcon={true}
                    />
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Takes 1/4 width */}
              <div className="xl:col-span-1">
                <div className="space-y-4">
                  {/* Recent Activity Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-0 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-50 to-amber-50 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                          <span className="text-white text-lg font-bold">🕒</span>
                        </div>
                        <div>
                          <h3 className="text-heading-4">Recent Activity</h3>
                          <p className="text-body-small text-muted">Latest updates</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">New RFP created</p>
                            <p className="text-xs text-slate-500 mt-1 font-normal">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all duration-300">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">RFP approved</p>
                            <p className="text-xs text-slate-500 mt-1 font-normal">5 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-all duration-300">
                          <div className="w-3 h-3 bg-amber-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">RFP under review</p>
                            <p className="text-xs text-slate-500 mt-1 font-normal">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-0 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                          <span className="text-white text-lg font-bold">🚀</span>
                        </div>
                        <div>
                          <h3 className="text-heading-4">Quick Actions</h3>
                          <p className="text-body-small text-muted">Common tasks</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg font-semibold">
                          <span className="mr-3 text-base">📝</span>
                          Create New RFP
                        </button>
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 rounded-xl hover:from-slate-200 hover:to-gray-200 transition-all duration-300 font-semibold">
                          <span className="mr-3 text-base">📊</span>
                          View Reports
                        </button>
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 rounded-xl hover:from-slate-200 hover:to-gray-200 transition-all duration-300 font-semibold">
                          <span className="mr-3 text-base">⚙️</span>
                          Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;