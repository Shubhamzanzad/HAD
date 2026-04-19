import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { FaCaretRight } from "react-icons/fa";
import DeleteDialog from "../DeleteDialog";
import { jwtDecode } from "jwt-decode";
import useAuth from "../../../hooks/useAuth";
function Profile({ patientId }) {

  const [PatientDetails, setPatientDetails] = useState({});
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const [role, setRole] = useState("");
  useEffect(() => {
    const getPatientDetails = async () => {
      try {
        const path = `/patient/getPatientDetails?id=${patientId}`;
        const resp = await axiosPrivate.get(path);
        setPatientDetails(resp.data);
        console.log(resp.data)
      } catch (error) {
        // console.log(error);
      }
    };
    getPatientDetails();
    setRole(decoded?.role);
  }, []);
  return (
    <div>
      <div className="w-full">
        <div className="mt-5 flex">
          <div className="ml-8 w-20 h-20 rounded-full">
            <img
              className="rounded-full mt-6"
              src="https://images.pexels.com/photos/3394658/pexels-photo-3394658.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="profile photo"
            />
          </div>
          <div className="w-full">
            <div className="mt-4 ml-8">
              <p className="text-xl font-semibold">{PatientDetails.name}</p>
            </div>
            <div className="flex mt-2 ml-8 text-sm">
              <div className="flex-1">
                <span className="font-semibold flex mr-20 text-[#7B7878]">
                  Gender:
                  <p className="ml-6 text-black">{PatientDetails.gender}</p>
                </span>
              </div>
              <div className="flex-1">
                <span className="font-semibold flex ml-auto mr-20 text-[#7B7878]">
                  Date of Birth:
                  <p className="ml-6 text-black">{PatientDetails.dob}</p>
                </span>
              </div>
              <div className="flex-1">
                <span className="font-semibold flex ml-auto mr-20 text-[#7B7878]">
                  ABHA Id:
                  <p className="ml-6 text-black">{PatientDetails.abhaAddress}</p>
                </span>
              </div>
              <div className="flex-1">
                <span className="font-semibold flex ml-auto mr-20 text-[#7B7878]">
                  Email id:
                  <p className="ml-6 text-black">{PatientDetails.email}</p>
                </span>
              </div>
            </div>
            <div className="flex mt-4 ml-8 text-sm">
              <div className="w-1/4">
                <span className="font-semibold flex mr-52 text-[#7B7878]">
                  Blood Group:
                  <p className="ml-6 text-black">{PatientDetails.bloodGroup}</p>
                </span>
              </div>
              <div className="w-1/4">
                <span className="font-semibold flex mr-20 text-[#7B7878]">
                  Mobile Number:
                  <p className="ml-6 text-black ">
                    {PatientDetails.mobileNumber}
                  </p>
                </span>
              </div>
              <div className="w-1/4">
                {/* <button
                    className="inline-flex justify-center items-center gap-[10px] rounded-lg
                                        border border-[#584848] bg-[#e0a2a2] text-[20px] text-[#802727] font-semibold p-2.5"
                    // onClick={}
                  >
                    <div>Delete</div>
                    <FaCaretRight className="h-[25px] w-[25px]" />
                  </button> */}
                {(role === "HEAD_DOCTOR" || role === "STAFF") && (
                  <>
                    <DeleteDialog patient={PatientDetails} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="bg-[#7B7878] h-0.25 mt-4" />
    </div>
  );
}

export default Profile;
