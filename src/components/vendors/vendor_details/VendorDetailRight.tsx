// ApprovalWorkflow.tsx
import React, { SetStateAction, useEffect, useState } from 'react';
import { getAllUsersByFilterAsync } from '../../../services/userService';
import PageLoader from '../../basic_components/PageLoader';
import { notification } from 'antd';
import { IRfp } from '../../../types/rfpTypes';
import { GeneralDetailIcon } from '../../../utils/Icons';
import Table from '../../basic_components/Table';
import { IFilterDto } from '../../../types/commonTypes';
import Modal from '../../basic_components/Modal';
import { getAllProposalsByFilterAsync } from '../../../services/rfpService';

interface User {
    name: string;
    image?: string;
    email: string;
    role: string;
    id?: string;
}

interface IOwnerDetails {
    ownerName: string,
    ownerId: string,
    ownerEmail: string
}



interface IRfpDetailRight {
    rfp: IRfp
    trigger: () => void
}

const RfpDetailRight: React.FC<IRfpDetailRight> = ({ rfp, trigger }) => {

    const [isModalOpenItem, setIsModalOpenItem] = useState<any>(null);
    const [vendorProposals, setVendorProposals] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [activeTab, setActiveTab] = useState("Proposals");
    const tabs = ["Proposals", "Clarifications"];

    const setupTabsAsync = async () => {
        try {
            if (activeTab == "Proposals") {
                const filtered_proposals = await getAllProposalsByFilterAsync(filter);
                setVendorProposals(filtered_proposals);
            }else if(activeTab == "Clarifications"){

            }
        } catch (err) {

        }
    }

    useEffect(() => {
setupTabsAsync();
    }, [activeTab])

    const [filter, setFilter] = useState<IFilterDto>({
        fields: [{columnName:"RfpId", value:rfp?.id ?? 0}],
        globalSearch: "",
        sortColumn: "CreatedAt",
        sortDirection: "DESC"
    })
    const proposalTableColumns = ["vendorCode", "vendorName", "bidAmount", "bidValidity"]
    const columnLabels = { vendorCode: "ID", vendorName: "Vendor Name", bidAmount: "Bid Amount", bidValidity: "Bid Validity" }


    return (
        <>
            <div className="w-full bg-white">
                <div className="w-full space-y-2 desktop:max-w-[700px] mx-auto rounded-lg h-full px-6 max-h-[900px] overflow-y-auto scrollbar">
                    <div className="relative flex items-center sticky top-0 bg-white z-10">
                        <div className="overflow-x-auto py-4 flex-1 scroll-smooth no-scrollbar border-b">
                            <div className="pt-[24px] flex justify-start mb-[16px]">
                                {tabs.map((tab, index) => (
                                    <div className="flex items-center h-[37px]" key={tab}>
                                        <div
                                            onClick={() => setActiveTab(tab)}
                                            className={`relative h-full w-full text-sm text-start cursor-pointer ${activeTab === tab
                                                ? "text-customBlue"
                                                : "text-black hover:text-customBlue"
                                                }`}
                                        >
                                            <span
                                                onClick={() => setActiveTab(tab)}
                                                className={`cursor-pointer font-bold text-[16px] flex items-center ${activeTab === "proposals" ? "border-black" : "text-gray-500"}`}
                                            >
                                                <GeneralDetailIcon className="size-5" />
                                                <span className={`pl-[8px] ${activeTab === tab ? "text-customBlue"
                                                    : "text-black hover:text-customBlue"
                                                    }`}>{tab}</span>
                                                <span
                                                    className={`absolute bottom-0 left-0 w-full h-[3px] rounded-t-[10px] ${activeTab === "proposals"
                                                        ? "bg-customBlue"
                                                        : "bg-transparent group-hover:bg-customBlue"
                                                        }`}
                                                ></span></span>
                                            <span
                                                className={`absolute bottom-0 left-0 w-full h-[3px] rounded-t-[10px] ${activeTab === tab
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
                        </div>
                    </div>

                    <div className="w-full">
                        {activeTab === "Proposals" && (
                            <Table
                                columnLabels={columnLabels}
                                items={vendorProposals}
                                columns={proposalTableColumns}
                                title="Proposals"
                                type="proposal"
                                setIsModalOpenItem={setIsModalOpenItem}
                                filter={filter}
                                setFilter={setFilter}
                                setSearchQuery={setSearchQuery}
                                totalCount={10}
                            />
                        )}
                        {activeTab === "Clarifications" && (
                            <div></div>
                        )}
                    </div>
                </div>
            </div>
        </>)
};

export default RfpDetailRight;