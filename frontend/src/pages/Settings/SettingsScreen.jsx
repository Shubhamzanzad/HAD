import BaseScreen from "../BaseScreen";
import React, { useState, useEffect } from "react";
import EditTab from "./components/EditTab";
import StaffEdit from "./components/StaffEdit";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { jwtDecode } from "jwt-decode";
import useAuth from "../../hooks/useAuth";
import TopBar from "../TopBar";

const SettingsScreen = () => {
  const axiosPrivate = useAxiosPrivate();
  const [userDetails, setUserDetails] = useState({});
  const { auth } = useAuth();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  useEffect(() => {
    setUsername(decoded?.sub);
    setRole(decoded?.role);
    const requestBody = {
      username: decoded?.sub,
    };
    const getUserDetails = async () => {
      try {
        const response = await axiosPrivate.post(
          `/auth/get-${decoded?.role.toLocaleLowerCase()}-details-by-username`,
          requestBody
        );
        // console.log(response.data);
        setUserDetails(response.data);
      } catch (err) {
        if (!err?.response) {
          // console.error("No Server Response");
        }
      }
    };
    getUserDetails();
  }, []);
  return (
    <div className="flex flex-col h-full">
      {/* <div className="h-[64px] w-full pb-16 bg-white"></div> */}
      <div className="bg-white grow m-3">
        <div className="flex flex-col">
          {/* <Profile patientId={id} /> */}
          <div className="">
            <div className="flex mt-6 mb-8  justify-center">
              <StaffEdit userDetails={userDetails} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsScreen;
