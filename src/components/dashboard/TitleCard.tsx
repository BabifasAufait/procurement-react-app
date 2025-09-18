import CreateButton, { PublishButton } from "../buttons/CreateButton";
import { useNavigate } from "react-router-dom";
import { getUserCredentials } from "../../utils/common";
import { useEffect } from "react";

const TitleCard = ({ trigger }: { trigger: () => void }) => {
    const navigate = useNavigate();
    const onCreateRequest = () => {
        navigate("/rfps/create-rfp")
    }

    const onPublishRfps = () => {
        navigate("/rfps/publish-rfps")
    }

    useEffect(()=>{
        trigger && trigger();
    },[])


    return (
        <div className="bg-white rounded-2xl shadow-lg border-0 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -translate-y-24 translate-x-24"></div>
            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-2xl font-bold">👋</span>
                        </div>
                        <div>
                            <h1 className="text-heading-1">
                                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-bold">{getUserCredentials().name}</span>!
                            </h1>
                            <p className="text-body-large text-muted mt-2">Welcome back, let's get things done today</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-caption">Ready to create?</p>
                            <p className="text-body-small text-subtle">Start a new RFP request</p>
                        </div>
                        <CreateButton name="Create RFP" onClick={onCreateRequest} />
                        <PublishButton name="Publish RFPs" onClick={onPublishRfps} />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default TitleCard

