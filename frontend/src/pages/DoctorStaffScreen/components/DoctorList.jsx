import { MdSearch } from "react-icons/md";
import AddDoctorForm from "../forms/AddDoctorForm";
import DoctorDetail from "./DoctorDetail";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useAuth from "../../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

const DoctorList = () => {
  const [allDoctorList, setAllDoctorList] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const [search, setSearch] = useState("");
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(decoded?.role)
    const getDoctorDetails = async () => {
      try {
        const response = await axiosPrivate.get(
          `/doctor/getAllDoctorList`
        );
        // console.log(response.data);
        setAllDoctorList(response.data);
      } catch (err) {
        if (!err?.response) {
          // console.error("No Server Response");
        }
      }
    };
    getDoctorDetails();
  }, []);

  const handleDataFromChild = async (data) => {
    if (data) {
      try {
        const response = await axiosPrivate.get(
          `/doctor/getAllDoctorList`
        );
        // console.log(response.data);
        setAllDoctorList(response.data);
      } catch (err) {
        if (!err?.response) {
          // console.error("No Server Response");
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="basis-[15%]">
        <div className="text-[1.75rem] p-4 text-[#02685A] font-semibold flex flex-row m-4 justify-between items-center">
          <div className="relative">All Doctors List</div>
          {role === "HEAD_DOCTOR" && (
            <>
              <AddDoctorForm />
            </>
          )}
        </div>
      </div>
      <div className="flex flex-row m-4 justify-between items-center">
        <div className="relative">
          <input
            className="m-4 h-[3.375rem] border-[#827F7F82] rounded-md focus:outline-none focus:ring focus:ring-[#02685A] focus:ring-opacity-70"
            type="text"
            placeholder="Search Doctor"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 right-2 flex items-center pr-4">
            <MdSearch className="h-[25px] w-[25px]" />
          </div>
        </div>
      </div>
      <div className="bg-[#827F7F82]  h-[0.5px] mx-8 my-4"></div>
      <div className="basis-[85%]">
        <div className="m-4 shadow-lg sm:rounded-lg 2xl:max-h-[500px] 4xl:max-h-[800px] lg:max-h-[500px] md:max-h-[450px] flex flex-col overflow-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
            <thead className="text-xs  uppercase h-[4.5rem]  bg-[#F5F6F8] text-[#7B7878] sticky top-0">
              <tr className="text-sm">
                <th scope="col" className="px-6 py-3">
                  S.No.
                </th>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Registration Number
                </th>
                <th scope="col" className="px-6 py-3">
                  Mobile Number
                </th>
                <th scope="col" className="px-6 py-3">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#444]">
              {allDoctorList
                .filter((doctor) => {
                  return search.toLowerCase() === ""
                    ? doctor
                    : doctor.first_Name
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                        doctor.last_Name
                          .toLowerCase()
                          .includes(search.toLowerCase());
                })
                .map((doctor, index) => (
                  <tr key={index} className="bg-white border">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-[#444] whitespace-nowrap">
                      {doctor.first_Name} {doctor.last_Name}
                    </td>
                    <td className="px-6 py-4">{doctor.registration_number}</td>
                    <td className="px-6 py-4">{doctor.mobile}</td>
                    <td className="px-6 py-4">{doctor.address}</td>
                    <td className="px-6 py-4 text-right">
                      <DoctorDetail sendDataToParent={handleDataFromChild} doctor={doctor} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default DoctorList;
