import { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useForm } from "react-hook-form";
import useAuth from "../../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { toast } from "react-toastify";

const StaffEdit = (userDetails) => {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();
  const axiosPrivate = useAxiosPrivate();
  const [states, setStates] = useState([]);
  const { auth } = useAuth();
  const [role, setRole] = useState("");
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const [district, setdistrict] = useState([]);
  useEffect(() => {
    const getStates = async () => {
      try {
        const response = await axiosPrivate.post(
          "/patient/getLgdStatesList"
        );
        setStates(response.data);
        // console.log(response.data);
      } catch (error) {
        // console.error("Error fetching data:", error);
      }
    };
    console.log(getValues());
    setRole(decoded?.role);
    getStates();
  }, []);

  const handleDistrict = (event) => {
    // console.log(event);
    const selectedState = states[event].districts;
    // console.log(selectedState);
    setdistrict(selectedState);
    // console.log(states);
    setValue("state", `${states[event].name}-${states[event].code}`);
  };

  const onSubmit = async () => {
    setValue("role", decoded?.role.toLowerCase());
    setValue("username", decoded?.sub);
    // console.log(getValues());
    try {
      const response = await axiosPrivate.post(
        `/auth/editDetails`,
        getValues()
      );
      toast.success(response.data);
      // console.log(response.data);
      // setUserDetails(response.data);
    } catch (err) {
      if (!err?.response) {
        // console.error("No Server Response");
        toast.error("No Server Response");
      }
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex flex-row">
        <div className="text-[#02685A] text-3xl font-bold p-0 ml-10 w-1/5 flex flex-col">
          <p>Edit Details</p>
        </div>
      </div>
      <div className="w-full">
        <div className="flex flex-col m-5 gap-2">
          <div className="w-full">
            <div className="flex mt-2 ml-8 text-l">
              <div className="flex-1">
                <span className="font-semibold flex ml-auto mr-20 text-[#7B7878]">
                  Name*
                  <p className="ml-6 text-black font-medium">
                    {userDetails.userDetails.first_Name}{" "}
                    {userDetails.userDetails.last_Name}
                  </p>
                </span>
              </div>
              <div className="flex-1">
                <span className="font-semibold flex mr-20 text-[#7B7878]">
                  Registration Number*
                  <p className="ml-6 text-black font-medium">
                    {userDetails.userDetails.registration_number}
                  </p>
                </span>
              </div>
              <div className="flex-1">
                <span className="font-semibold flex ml-auto mr-20 text-[#7B7878]">
                  Date of Birth
                  <p className="ml-6 text-black font-medium">
                    {userDetails.userDetails.dob}
                  </p>
                </span>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="flex mt-2 ml-8 text-l">
              <div className="flex-1">
                <span className="font-semibold flex ml-auto mr-20 text-[#7B7878]">
                  Gender
                  <p className="ml-6 text-black font-medium">
                    {userDetails.userDetails.gender}
                  </p>
                </span>
              </div>
              <div className="flex-1">
                <span className="font-semibold flex mr-20 text-[#7B7878]">
                  Qualification
                  <p className="ml-6 text-black font-medium">MBBS</p>
                </span>
              </div>
              <div className="flex-1"></div>
            </div>
          </div>

          <hr className="h-[3px] bg-[#7B7878] mx-2 mt-6 opacity-50	" />
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-3  gap-5 text-[#7B7878] font-medium text-xl  p-5">
              <div className="flex flex-col">
                <p className="text-xl pb-2 font-medium">Mobile Number</p>
                <input
                  className="rounded-md w-full"
                  type="text"
                  {...register("mobileNumber", { required: true })}
                />
              </div>
              <div className="flex flex-col">
                <p className="text-xl pb-2 font-medium">Email Address</p>
                <input
                  className="rounded-md w-full"
                  type="text"
                  {...register("email", { required: true })}
                />
              </div>
              <div className="flex flex-col"></div>
            </div>
            <hr className="h-[3px] bg-[#7B7878] mx-2 mt-6 opacity-50	" />
            <div className="grid grid-cols-3  gap-5 text-[#7B7878] font-medium text-xl  p-5">
              <div className="flex flex-col">
                <p className="text-xl pb-2 font-medium">Address Line*</p>
                <input
                  className="rounded-md w-full"
                  type="text"
                  {...register("addressLine", { required: true })}
                />
              </div>
              <div className="flex-1">
                <p className="mb-2">State*</p>
                <select
                  className="w-full rounded-md"
                  name="doctor"
                  onChange={(e) => handleDistrict(e.target.value)}
                  defaultValue="" // Set the default value to an empty string
                >
                  <option disabled value="">
                    Select State
                  </option>
                  {states.map((state, index) => (
                    <option
                      key={index}
                      className="font-light text-s option-hover"
                      value={index}
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <p className="mb-2">District*</p>
                <select
                  className="w-full rounded-md"
                  name="district"
                  id=""
                  {...register("district", {
                    required: "Required",
                  })}
                >
                  <option value="" hidden defaultValue={true}>
                    Select District
                  </option>
                  {district.map((item, index) => (
                    <option key={item.code} value={`${item.name}-${item.code}`}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="h-[3px] bg-[#7B7878] mx-2 mt-6 opacity-50	" />
            <div className="flex flex-col text-[#7B7878] px-5">
              <p className="text-xl pt-2 font-medium">Pincode</p>
              <input
                className="rounded-md w-1/4"
                type="text"
                {...register("pincode", {
                  required: "Required",
                })}
              />
            </div>
            <hr className="h-[3px] bg-[#7B7878] mx-2 mt-6 opacity-50	" />
            <div className="flex flex-row  gap-5 text-[#7B7878] font-medium text-xl m-10 p-5">
              <div className="items-start font-medium text-white justify-center px-4 py-2 bg-[#FFA000] rounded cursor-pointer">
                {role === "STAFF" ? (
                  <>
                    {/* Change it accordingly for staffID */}
                    <ChangePasswordDialog
                      id={userDetails.userDetails.staff_Id}
                      role={role}
                    />
                    Hello
                  </>
                ) : (
                  <>
                    <ChangePasswordDialog
                      id={userDetails.userDetails.doctor_Id}
                      role={role}
                    />
                  </>
                )}
              </div>
              <Button
                variant="filled"
                className="bg-[#FFA000] ml-auto"
                type="submit"
              >
                <span>Save</span>
              </Button>
              {/* <Button variant="filled" className="ml-auto bg-[#FFA000]" type="submit">
                <span>Save</span>
              </Button> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default StaffEdit;
