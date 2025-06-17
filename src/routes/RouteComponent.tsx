import React, { createContext, useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../components/basic_components/Sidebar';
import Cookies from "js-cookie";
import Dashboard from '../pages/dashboard/Dashboard';
import Register from '../pages/login_page/Register';
import ForgotPassPage from '../pages/forgot_pass_page/ForgotPass';
import ResetPassPage from '../pages/forgot_pass_page/ResetPass';
import { Login } from '../pages/login_page/Login';
import Navbar from '../components/basic_components/Navbar';
import SettingsPage from '../pages/settings_page/SettingsPage';
import { getUserToken } from '../utils/common';
import RfpRequestFormComponent from '../components/rfp_request/rfp_form/RfpRequestForm';
import { ICountryCode } from "../types/commonTypes";
import { getAllCountryCodes } from "../services/commonService";
import RequestPage from '../pages/request_page/RequestPage';
import RequestDetailPage from '../pages/rfp_detail/RfpDetailPage';
import VendorPage from '../pages/vendor_page/VendorPage';

interface procurementContextProp {
  countryCodes: ICountryCode[] | null;
}

export const procurementContext = createContext<procurementContextProp>({
  countryCodes: null,
})


const RouteComponent: React.FC = () => {

  const [countryCodes, setCountryCodes] = useState<ICountryCode[]>([]);
  // State for mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // State for user login status
  // TODO: Update this state via Login component or auth system
  const [userLoggedIn, setUserLoggedIn] = useState(true);
  const [_, setUserInfo] = useState({ name: "" });

  const navigate = useNavigate();
  // Update isMobile based on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

    // setup common datas like expendituretypes, departments
  async function setupCommonDatas(clientId: string) {
    try {

      let countryCodesData = await getAllCountryCodes();
      setCountryCodes(countryCodesData.sort((a: any, b: any) => (a.countryCode ?? "").localeCompare(b.countryCode ?? "")));

    } catch (e) {
      console.error("route", e);
    }
  }

  useEffect(() => {
    let isTokenExist = Cookies.get("token");
    if (isTokenExist) {
      setUserLoggedIn(true)
      let user_name = Cookies.get("name");
      let clientId = Cookies.get("clientId") ?? "no client id"
      setUserInfo((u) => ({ ...u, name: user_name }));
      setupCommonDatas(clientId);
    } else {
      setUserLoggedIn(false);
      navigate("/login");
    }
  }, [])

  return (
    <div className="w-full h-full">
      {/* <ErrorBoundary> */}
      <procurementContext.Provider value={{ countryCodes }}>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            <div className="w-full">
              <Login setUserLoggedIn={setUserLoggedIn}/>
            </div>
          }
        />

        <Route
          path="/register"
          element={
            <div className="w-full">
              <Register />
            </div>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <div className="w-full">
              <ForgotPassPage />
            </div>
          }
        />
        <Route
          path="/reset-password"
          element={
            <div className="w-full">
              <ResetPassPage />
            </div>
          }
        />
        {/* Authenticated Routes with Sidebar/Navbar */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen">
              {isMobile ? <Navbar notifications={[]} trigger={()=>{}}/> : <Sidebar notifications={[]} trigger={()=>{}}/>}
              <div
                className={`flex-1 min-h-screen bg-bgBlue ${isMobile ? 'mt-20' : 'ml-[78px]'
                  }`}
              >
                {userLoggedIn ? (
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/rfps" element={<RequestPage />} />
                    <Route path="/rfps/:id" element={<RequestDetailPage />} />
                    <Route path="/rfps/create-rfp" element={<RfpRequestFormComponent />} />
                    <Route path="/rfps/edit-rfp/:id" element={<RfpRequestFormComponent />} />
                    <Route path="/vendors" element={<VendorPage />} />
                    <Route path="/settings/user-managment" element={<SettingsPage />} />
                    <Route path="/settings/department-managment" element={<SettingsPage />} />
                    <Route path="/settings/workflow-managment" element={<SettingsPage />} />
                    <Route path="/settings/roles-managment" element={<SettingsPage />} />
                  </Routes>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      Please log in to access the procurement system
                    </p>
                  </div>
                )}
              </div>
            </div>
          }
        />
      </Routes>
      </procurementContext.Provider>
      {/* </ErrorBoundary> */}
    </div>
  );
};

export default RouteComponent;