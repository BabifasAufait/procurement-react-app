// ApprovalWorkflow.tsx
import React, { SetStateAction, useEffect, useState } from 'react';
// import { getAllUsersByFilterAsync } from '../../../services/userService';
// import PageLoader from '../../basic_components/PageLoader';
// import { notification } from 'antd';
import { IRfp } from '../../../types/rfpTypes';
import Table from '../../basic_components/Table';
import { IFilterDto } from '../../../types/commonTypes';
import Modal from '../../basic_components/Modal';
import ProposalSubmissionModal from './ProposalSubmissionModal';
import { getAllEvaluationReportsAsync, getAllProposalsByFilterAsync, getAllRfpIntrestByFilterAsync, uploadEvaluationReportAsync } from '../../../services/rfpService';
import ClarificationList from './ClarificationList';
import { DocumentIconByExtension, IntrestedIcon, OpenMainIcon } from '../../../utils/Icons';
import { notification } from 'antd';
import { getUserCredentials } from "../../../utils/common";
import { documentTypeConst } from "../../../utils/constants";

// interface User {
//     name: string;
//     image?: string;
//     email: string;
//     role: string;
//     id?: string;
// }

// interface IOwnerDetails {
//     ownerName: string,
//     ownerId: string,
//     ownerEmail: string
// }



interface IRfpDetailRight {
    rfp: IRfp
    trigger: () => void
    vendorProposals:any[]
    setVendorProposals:React.Dispatch<SetStateAction<any[]>>
}

const ItemCountCard: React.FC<{ item: { icon: any, label: string, bgColor: string, count: number }, className?: string }> = ({ item, className }) => {
    return (
        <div
            className={`w-full h-[64px] border border-gray-200 rounded-xl shadow-sm flex justify-between items-center px-[21px] ${className}`}>
            <div className="flex items-center"><div className="w-[32px] h-[32px] rounded-full mr-3 flex justify-center items-center" style={{ backgroundColor: item.bgColor }}>{item?.icon}</div>
                <span className="text-sm font-semibold text-black">{item.label}</span>
            </div>
            <span className="text-xl font-bold text-[#0B1F49]">{item.count}</span>
        </div>
    )
}

const RfpDetailRight: React.FC<IRfpDetailRight> = ({ rfp, trigger,vendorProposals, setVendorProposals }) => {

    const [isModalOpenItem, setIsModalOpenItem] = useState<any>(null);
    // const [vendorProposals, setVendorProposals] = useState<any[]>([]);
    const [vendorIntrestCount, setVendorIntrestCount] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [activeTab, setActiveTab] = useState("Proposals");
    const [evaluationDocuments, setEvaluationDocuments] = useState<any>([
    ]);
    const [ownerIn, setOwnerIn] = useState<{ technical: boolean; commercial: boolean }>({
        technical: false,
        commercial: false,
    });

    useEffect(() => {
        const tempOwnerIn = { technical: false, commercial: false };

        (rfp?.rfpOwners as any[])?.forEach((ow) => {
            if (
                ow.ownerId.toString() === getUserCredentials().userId &&
                ow.ownerType === documentTypeConst.technical
            ) {
                tempOwnerIn.technical = true;
            } else if (
                ow.ownerId.toString() === getUserCredentials().userId &&
                ow.ownerType === documentTypeConst.commercial
            ) {
                tempOwnerIn.commercial = true;
            }
        });

        setOwnerIn(tempOwnerIn);
    }, [rfp]);

    const maskedProposals = vendorProposals.map((p) => ({
        ...p,
        bidAmount: ownerIn.commercial || rfp?.createdBy?.toString() == getUserCredentials().userId ? p.bidAmount : "*******",
        bidValidity: ownerIn.commercial || rfp?.createdBy?.toString() == getUserCredentials().userId ? p.bidValidity : "*******",
    }));

    const tabs = ["Proposals", "Clarifications"];

    const handleProposalFilter = async (filterDto: IFilterDto = filter) => {
        try {
            if (activeTab == "Proposals") {
                const filtered_proposals = await getAllProposalsByFilterAsync(filterDto);
                setVendorProposals(filtered_proposals);
            }
        } catch (err) {

        }
    }

    const setupTabsAsync = async () => {
        try {
            if (activeTab == "Proposals") {
                const intrestOnRfp = await getAllRfpIntrestByFilterAsync({
                    fields: [{
                        columnName: "RfpId",
                        value: rfp?.id ?? 0
                    }]
                })
                setVendorIntrestCount(intrestOnRfp.length);
                if (rfp?.status != 5) {
                    const evaluationReports = await getAllEvaluationReportsAsync(Number(rfp?.id || "0"));
                    const evalutionDocumentMapped = evaluationReports.map((d: any) => ({ documentUrl: d.filePath, documentName: d.fileTitle }));
                    setEvaluationDocuments(evalutionDocumentMapped);
                }
            } else if (activeTab == "Clarifications") {

            }
            trigger && trigger()
        } catch (err) {

        }
    }

    useEffect(() => {
        handleProposalFilter({ ...filter, globalSearch: searchQuery });
    }, [searchQuery])

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files ? event.target.files[0] : null;
        if (selectedFiles) {
            setEvaluationDocuments([{ document: selectedFiles, documentName: selectedFiles.name, documentUrl: URL.createObjectURL(selectedFiles) }]);
            const formData = new FormData();
            formData.append("rfpId", rfp?.id?.toString() ?? "0");
            formData.append("file", selectedFiles);
            await uploadEvaluationReportAsync(formData);
            notification.success({
                message: "document uploaded successfully"
            })
        }
    };

    useEffect(() => {
        setupTabsAsync();
        console.log(searchQuery)
    }, [activeTab, searchQuery])

    const [filter, setFilter] = useState<IFilterDto>({
        fields: [{ columnName: "RfpId", value: rfp?.id ?? 0 }],
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
                    <div className="flex items-center sticky top-0 bg-white z-10">
                        <div className="overflow-x-auto py-4 flex-1 scroll-smooth no-scrollbar">
                            <div className="pt-[24px] flex justify-start border-b ml-[10px]">
                                {tabs.map((tab, index) => (
                                    <div className="flex items-center h-[37px]" key={tab}>
                                        <div
                                            onClick={() => setActiveTab(tab)}
                                            className={`relative h-full w-full text-sm text-start cursor-pointer font-semibold ${activeTab === tab
                                                ? "text-customBlue"
                                                : "text-gray-500 hover:text-black"
                                                }`}
                                        >
                                            {tab}
                                            <span
                                                className={`absolute bottom-0 left-0 w-full h-[3px] ${activeTab === tab
                                                    ? "bg-customBlue"
                                                    : "bg-transparent group-hover:bg-customeBlue"
                                                    }`}
                                            ></span>
                                        </div>
                                        {index !== tabs.length - 1 && (
                                            <span className="mx-[12px] h-[37px] text-gray-400"></span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        {activeTab === "Proposals" && <>
                            {rfp?.status == 5 ?
                                <>
                                    <ItemCountCard className="mb-[16px]" item={{
                                        icon: <OpenMainIcon className='w-[16px] h-[16px] text-white' />,
                                        bgColor: "#314DA0",
                                        count: vendorProposals?.length || 0,
                                        label: "Total Proposals Received"
                                    }} />
                                    <ItemCountCard item={{
                                        icon: <IntrestedIcon className='w-[16px] h-[16px] text-white' />,
                                        bgColor: "#BFDC1A",
                                        count: vendorIntrestCount,
                                        label: "Total Interest Submitted"
                                    }} />
                                </> :
                                <>
                                    <div
                                        className={`border border-lightblue p-4 flex text-sm rounded-lg bg-[#EDF4FD] mb-[16px] flex-col`}
                                    >
                                        <div className="pr-[55px] group relative">
                                            <span className="font-bold text-[16px] mb-[17.5px] flex"><span>Evaluation Report</span></span>
                                            <div className='flex flex-col'>
                                                {
                                                    evaluationDocuments.map((d: any) => (<span><a className="text-[13px] flex items-end mb-5" href={d.documentUrl ? d.documentUrl : d.document} target="blank" download={d.documentName} ><DocumentIconByExtension className="w-[25px] h-[25px]" filePath={d.documentUrl} /><p className="pl-[4px]" style={{ color: "blue", textDecoration: "underline" }}>{d.documentName}</p></a>{rfp?.status != 6 && <label htmlFor="upload-eval-file"><span className='px-3 py-2 bg-white rounded-md border'>Reupload</span></label>}</span>))
                                                }
                                            </div>
                                            {evaluationDocuments.length == 0 &&
                                                <label htmlFor="upload-eval-file">
                                                    <span className="text-gray-500 hover:underline cursor-pointer text-sm font-regular mb-1">
                                                        Drag and drop your files here or
                                                    </span>{" "}
                                                    <span className="text-blue-600 hover:underline cursor-pointer text-sm font-medium mb-1">
                                                        browse
                                                    </span>
                                                </label>}
                                            <input
                                                type="file"
                                                id="upload-eval-file"
                                                accept=".pdf,.docx,.jpg,.png"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                    <Table
                                        columnLabels={columnLabels}
                                        items={maskedProposals}
                                        columns={proposalTableColumns}
                                        title="Proposals"
                                        type="proposal"
                                        setIsModalOpenItem={setIsModalOpenItem}
                                        filter={filter}
                                        setFilter={setFilter}
                                        setSearchQuery={setSearchQuery}
                                        totalCount={10}
                                    />
                                </>
                            }
                        </>
                        }
                        {activeTab === "Clarifications" && (
                            <div>
                                <ClarificationList rfpId={rfp?.id as number} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Modal content={<ProposalSubmissionModal rfp={rfp} proposal={isModalOpenItem} trigger={() => { setIsModalOpenItem(null); trigger(); }} />} isOpen={isModalOpenItem} onClose={() => setIsModalOpenItem(null)} modalPosition='end' width="w-full md:w-2/5" />
        </>)
};

export default RfpDetailRight;