import { notification } from 'antd';
import React, { useEffect, useState } from 'react';
import ApprovalWorkflowForm from './ApprovalWorkflowForm';
import { getApprovalFlowAsync } from '../../../services/flowService';
import { IUserDetails } from '../../../types/userTypes';
import ViewApprovalFlow from './ViewApprovalFlowCard';
import { getAllUsersByFilterAsync } from '../../../services/userService';

const tabs = [
  { label: "Vendor Approvalflow", type: "vendor", flowType: 1 },
  { label: "RFP Approvalflow", type: "rfpsubmission", flowType: 2 },
  { label: "RFP Proposal", type: "rfpproposal", flowType: 3 },
  { label: "RFP Award", type: "rfpaward", flowType: 4 },
];

const ApprovalWorkflow: React.FC = () => {
  const [trigger, setTrigger] = useState(false);
  const [, setIsCreateModalOpen] = useState(false);
  const [usersData, setUsersData] = useState<IUserDetails[] | null>(null);
  const [workflow, setWorkflow] = useState<any>();
  const [viewType, seViewType] = useState<"view" | "edit" | "create" | "no-access">("view");
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const setWorkflowsData = async () => {
    try {
      try {
        const response = await getApprovalFlowAsync(activeTab.type);
        console.log(response, "response-approv");
        setWorkflow(response);
      } catch (err: any) {
        console.log(err);
        if (err.status && err.status === 403) {
          seViewType("no-access");
          return;
        } else {
          seViewType("create");
        }
      }

      let users: any = await getAllUsersByFilterAsync();
      setUsersData(users.items);
      setTrigger(false);
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    setWorkflowsData();
    setWorkflow(undefined);
  }, [activeTab, trigger]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">⚡</span>
            </div>
            <div>
              <h1 className="text-heading-2">Approval Workflow</h1>
              <p className="text-body-small text-muted">Configure approval processes and workflows</p>
            </div>
          </div>
          <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            <span className="text-button text-indigo-700">
              Workflow Management
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab);
                seViewType("view");
              }}
              className={`px-6 py-3 text-button rounded-xl transition-all duration-200 ${
                activeTab.label === tab.label
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 !text-white shadow-lg"
                  : "text-muted hover:text-slate-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {viewType === "view" ? (
          <ViewApprovalFlow
            label={activeTab.label}
            seViewType={seViewType as any}
            flowDetails={workflow as any}
            usersData={usersData || []}
            closeModal={() => setIsCreateModalOpen(false)}
            trigger={() => {}}
          />
        ) : viewType === "no-access" ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚫</span>
            </div>
            <h3 className="text-heading-4 mb-2">Access Denied</h3>
            <p className="text-body text-muted">You don't have access to view this workflow</p>
          </div>
        ) : (
          <ApprovalWorkflowForm
            flowType={activeTab.flowType}
            seViewType={seViewType as any}
            type={viewType as any}
            closeModal={() => setIsCreateModalOpen(false)}
            trigger={() => {
              setTrigger(true);
            }}
            initialData={workflow}
          />
        )}
      </div>
    </div>
  );
};

export default ApprovalWorkflow;
