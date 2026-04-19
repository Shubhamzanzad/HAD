import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FaRegListAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { RiHospitalFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function AccountDetails({ isHeadDoc, data }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  useEffect(() => {
    // console.log(data);
    const windowValues = window.location.search;
    const requestParams = new URLSearchParams(windowValues);
    const isHeadDoctor = "true" === requestParams.get("isHeadDoctor");
    setValue("hpr_Id", data.hprId);
    setValue("first_Name", data.firstName);
    setValue("last_Name", data.lastName);
    setValue("gender", data.gender);
    setValue("state", data.stateName);
    setValue("district", data.districtName);
    setValue("state_Code", data.stateCode);
    setValue("district_Code", data.districtCode);
    setValue("pincode", data.pincode);
    setValue("address", data.address);
    setValue("dob", data.dob);
    setValue("isHeadDoctor", isHeadDoctor);
    if (isHeadDoc) setValue("isHeadDoctor", isHeadDoc);
  });

  const onSubmit = async () => {
    try {
      // console.log(getValues())
      const resp = await axios.post(
        "/auth/registerDoctor",
        getValues()
      );
      console.log(resp);
      const decoded = jwtDecode(resp.data.token)
      if (resp.status === 200) {
        navigate("/login");
        toast.success(resp.data.status);
        if (decoded?.role === "HEAD_DOCTOR") navigate("/register/HPR");
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.response.data);
    }
  };

  return (
    <div className="bg-white">
      <div className="bg-white mx-10 text-white h-screen">
        <div className="h-4"></div>
        <div className="mx-40 border border-black rounded-md">
          <div className="my-5 h-20 bg-[#98a2a3] flex items-center justify-center text-3xl font-semibold text-white py-5">
            Welcome to MediSync
          </div>

          <div className="h-40 flex items-center justify-center">
            {isHeadDoc ? (
              <div>
                <div className="h-full flex items-center justify-between">
                  <div className="w-24 h-1 bg-[#02685A] my-2 rounded-l-lg"></div>
                  <div className="w-20 h-20 bg-[#02685A] my-1.5 rounded-full flex justify-center items-center">
                    <FaRegListAlt className="h-[25px] w-[25px]" />
                  </div>
                  <div className="w-36 h-1 bg-[#02685A] my-2"></div>
                  <div className="w-23 h-23 bg-[#5AAC74] rounded-full">
                    <div className="w-20 h-20 bg-[#02685A] mx-1.5 my-1.5 rounded-full flex justify-center items-center">
                      <FaUser className="h-[30px] w-[30px]" />
                    </div>
                  </div>
                  <div className="w-36 h-1 bg-[#02685A] my-2"></div>
                  <div className="w-20 h-20 bg-[#DDDDDD] rounded-full flex justify-center items-center">
                  <RiHospitalFill className="h-[25px] w-[25px]" />
                </div>
                <div className="w-24 h-1 bg-[#DDDDDD] my-2 rounded-r-lg"></div>
                </div>

                <div className="flex mt-2">
                  <p className="ml-24 text-[#02685A] font-semibold text-xl">
                    Link HPR
                  </p>
                  <p className="ml-28 text-[#02685A] font-semibold text-xl">
                    Account Details
                  </p>
                  <p className="ml-20 text-[#7F8C8D] font-semibold text-xl">
                  Practice Details
                </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="h-full flex items-center justify-between">
                  <div className="w-24 h-1 bg-[#02685A] my-2 rounded-l-lg"></div>
                  <div className="w-20 h-20 bg-[#02685A] my-1.5 rounded-full flex justify-center items-center">
                    <FaRegListAlt className="h-[25px] w-[25px]" />
                  </div>
                  <div className="w-36 h-1 bg-[#02685A] my-2"></div>
                  <div className="w-23 h-23 bg-[#5AAC74] rounded-full">
                    <div className="w-20 h-20 bg-[#02685A] mx-1.5 my-1.5 rounded-full flex justify-center items-center">
                      <FaUser className="h-[30px] w-[30px]" />
                    </div>
                  </div>
                  <div className="w-36 h-1 bg-[#02685A] my-2"></div>
                  {/* <div className="w-36 h-1 bg-[#DDDDDD] my-2"></div> */}
                  {/* <div className="w-20 h-20 bg-[#DDDDDD] rounded-full flex justify-center items-center">
                  <RiHospitalFill className="h-[25px] w-[25px]" />
                </div>
                <div className="w-24 h-1 bg-[#DDDDDD] my-2 rounded-r-lg"></div> */}
                </div>

                <div className="flex mt-2">
                  <p className="ml-24 text-[#02685A] font-semibold text-xl">
                    Link HPR
                  </p>
                  <p className="ml-28 text-[#02685A] font-semibold text-xl">
                    Account Details
                  </p>
                  {/* <p className="ml-20 text-[#7F8C8D] font-semibold text-xl">
                  Practice Details
                </p> */}
                </div>
              </div>
            )}
          </div>

          <div className="flex px-32 bg-white mt-10">
            <p className="font-semibold py-1.5 text-[#5F5F5F] text-lg">
              Hello Doc, It is important to fill all the details to use the
              platform !
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="my-12 bg-white px-32 text-black overflow-auto h-[350px]">
              <div className="flex mb-3 grid grid-cols-3 gap-5">
                <div className="flex-1">
                  <p className="text-sm font-semibold ">First Name*</p>
                  <input
                    className="mt-3 rounded-md w-full"
                    type="text"
                    name=""
                    {...register("first_Name", { required: "Required" })}
                  />
                </div>
                <div className="flex-1 ">
                  <p className="text-sm font-semibold ">Last Name*</p>
                  <input
                    className="mt-3 rounded-md w-full"
                    type="text"
                    {...register("last_Name", { required: "Required" })}
                  />
                </div>
                <div className="flex-1 ">
                  <p className="text-sm font-semibold ">Date of Birth*</p>
                  <input
                    className="mt-3 rounded-md w-full"
                    type="date"
                    {...register("dob", { required: "Required" })}
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold ">Gender*</p>
                  <select
                    className="w-full mt-3 rounded-md"
                    {...register("gender", { required: "Required" })}
                  >
                    <option hidden defaultValue={true}>
                      Select Gender
                    </option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold ">Mobile Number*</p>
                  <input
                    className="mt-3 rounded-md w-full"
                    type="text"
                    {...register("mobile", {
                      required: "Required",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only Numbers are allowed",
                      },
                    })}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold ">Registration Number*</p>
                  <input
                    className="mt-3 rounded-md w-full"
                    type="text"
                    {...register("registration_number", {
                      required: "Required",
                    })}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold ">Email*</p>
                  <input
                    className="mt-3 rounded-md w-full"
                    type="text"
                    {...register("email", {
                      required: "Required",
                    })}
                  />
                </div>
              </div>

              <hr className="w-full h-0.5 bg-[#DDDDDD] mt-10" />

              <div className="flex mt-3 mb-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold ">Address Line*</p>
                  <input
                    className="mt-3 rounded-md w-full"
                    type="text"
                    {...register("address", { required: "Required" })}
                  />
                </div>
                <div className="flex-1 mx-10">
                  <p className="text-sm font-semibold ">Town*</p>
                  <input
                    className="mt-3 rounded-md w-full"
                    type="text"
                    {...register("district", { required: "Required" })}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold ">Pincode*</p>
                  <input
                    className="mt-3 rounded-md w-full"
                    type="number"
                    {...register("pincode", {
                      required: "Required",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only Numbers are allowed",
                      },
                    })}
                  />
                </div>
              </div>

              <div className="flex">
                <div className="flex-1">
                  <p className="text-sm font-semibold  mb-2">State*</p>
                  <input
                    className="w-full rounded-md"
                    type="text"
                    {...register("state", { required: "Required" })}
                  />
                </div>
                <div className="flex-1 mx-10"></div>
                <div className="flex-1"></div>
              </div>

              <div className="w-full h-0.5 bg-[#DDDDDD] mt-10 my-2"></div>

              <div className="flex mt-3 mb-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold ">Set Username*</p>
                  <input
                    className="mt-3 rounded-md w-full"
                    type="text"
                    {...register("username", { required: "Required" })}
                  />
                </div>
                <div className="flex-1 mx-10">
                  <p className="text-sm font-semibold ">Set Password*</p>
                  <input
                    className="mt-3 rounded-md w-full"
                    type="password"
                    {...register("password", { required: "Required" })}
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-0.5 bg-[#DDDDDD] mt-20 my-2 "></div>
            <div className="pl-80 my-5 pr-32">
              <button
                className="bg-[#FFA000] block font-bold w-56 h-12 text-xl rounded-md ml-auto"
                type="submit"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccountDetails;
