import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { notification, Spin } from "antd";
import { IStep } from "../../../../types/approvalflowTypes";
import { approveVendorAsync, rejectVendorAsync } from "../../../../services/flowService";
import { getVendorCriteriasAsync } from "../../../../services/vendorService";
import { Check, X } from "lucide-react";


// const checklistData: ChecklistItem[] = [
//   { id: 0, criteria: "Company Profile", isChecked: true },
//   { id: 1, criteria: "Quality Management System", isChecked: true },
//   { id: 2, criteria: "Health & Safety Management System Certification", isChecked: true },
//   { id: 3, criteria: "System to ensure that Oman Air quality requirements are considered during project phases", isChecked: true },
//   { id: 4, criteria: "Process control throughout the operation. This includes tracking system to identify the source of product/service non conformities (NCR).", isChecked: true },
//   { id: 5, criteria: "Customer Profile", isChecked: true },
//   { id: 6, criteria: "International Experience", isChecked: true },
//   { id: 7, criteria: "Continuous Improvement", isChecked: true },
//   { id: 8, criteria: "Cost Innovation", isChecked: true },
//   { id: 9, criteria: "Site visit", isChecked: true },
//   { id: 10, criteria: "Factory inspection", isChecked: true },
// ];
const CurrentStep: React.FC<{ step: IStep; trigger: () => void, flowType:"rfp" | "rfpproposal" | "rfpaward", proposalId?:number }> = ({
  step,
  trigger,
  flowType,
  proposalId
}) => {
  const currentUserId = Cookies.get("userId") || "";
  const [selectedAction, setSelectedAction] = useState<"approved" | "rejected">("approved");
  const [approveComment, setApproveComment] = useState("");
  const [showLoaderOnButton, setShowLoaderOnButton] = useState<boolean>(false);
  const [checklistData, setChecklistData] = useState<any[]>([])
  const { id } = useParams();



  const handleActionClick = (action: "approved" | "rejected") => {
    setSelectedAction(action);
    setApproveComment("");
    // setErrors({
    //   approveComment: ""
    // });
  };

  const handleSubmit = async () => {
    try {
      //const newErrors = { approveComment: "" };
      let hasError = false;
      // if (selectedAction === "approved" && !approveComment.trim()) {
      //   newErrors.approveComment = "Comments are required for approval.";
      //   hasError = true;
      // }

      // if (selectedAction === "rejected" && !approveComment.trim()) {
      //   newErrors.approveComment = "Comments are required for rejection.";
      //   hasError = true;
      // }

      // setErrors(newErrors);

      if (hasError) return;
      setShowLoaderOnButton(true)
      if (selectedAction === "approved") {
        if(flowType == "rfpaward" && !proposalId)notification.warning({
          message:"Please select proposal any proposal"
        })
        await approveVendorAsync({ stepId: step.id, approverEmail: step.approverEmail, comments: approveComment, vendorId: Number(id), criteriasCheckChanges: checklistData }, flowType, flowType == "rfpaward" ? proposalId : 0)

      } else if (selectedAction === "rejected") {
        await rejectVendorAsync({ stepId: step.id, approverEmail: step.approverEmail, comments: approveComment, vendorId: Number(id), criteriasCheckChanges: checklistData }, flowType)
      }
      setShowLoaderOnButton(false)
      trigger();
    } catch (err) {
      setShowLoaderOnButton(false)
    }
  };

  const setupCurrentStepsData = async () => {
    try {
      const criterias_list = await getVendorCriteriasAsync(Number(id));
      setChecklistData(criterias_list);
    } catch (err) {

    }
  }
  useEffect(() => {
    setupCurrentStepsData();
  }, [])

  return (
    <>
      {step?.approverId.toString() === currentUserId && (
        <div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-4">
            {step.status === "pending" && (
              <>
                <button
                  type="button"
                  disabled={showLoaderOnButton}
                  className={`pl-4 pr-5 py-1.5 text-sm rounded flex ${selectedAction === "approved" ? "text-white bg-[#0F9670]" : "bg-[#0F96701A]"}`}
                  onClick={() => handleActionClick("approved")}
                >
                  <Check className="w-5 h-5 mr-1"/>
                  Approve
                </button>
                <button
                  type="button"
                  disabled={showLoaderOnButton}
                  className={`pl-4 pr-5 py-1.5 text-sm rounded flex hover:bg-red-00 ${selectedAction === "rejected" ? "text-white bg-[#DB5A63]" : "bg-[#DB5A631A]"}`}
                  onClick={() => handleActionClick("rejected")}
                >
                  <X className="w-5 h-5 mr-1" />
                  Reject
                </button>
              </>
            )}
          </div>
          <div className="mb-4 bg-[#EBEEF480] p-4 rounded-lg">



            {selectedAction === "approved" && (
              <div className="mb-2">
                <label htmlFor="approve-comment" className="text-sm text-gray-500">
                  Comments
                </label>
                <textarea
                  id="approve-comment"
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  className="w-full border border-gray-200 rounded p-3 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your comments for approval"
                />
                {/* {errors.approveComment && <p className="text-red-500 text-xs mb-1">{errors.approveComment}</p>} */}
              </div>
            )}

            {selectedAction === "rejected" && (
              <div className="mb-2">
                <label htmlFor="reject-comment" className="text-sm text-gray-500">
                  Comments
                </label>
                <textarea
                  id="reject-comment"
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  className="w-full border border-gray-200 rounded p-3 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your comments for rejection"
                />
                {/* {errors.approveComment && <p className="text-red-500 text-xs mt-1">{errors.approveComment}</p>} */}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                disabled={showLoaderOnButton}
                onClick={handleSubmit}
                className={`px-4 py-1.5 bg-blue-500 ${showLoaderOnButton ? "bg-gray-200" : "hover:bg-blue-600"} text-white text-sm rounded`}
              >
                {showLoaderOnButton ? <Spin /> : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CurrentStep;
