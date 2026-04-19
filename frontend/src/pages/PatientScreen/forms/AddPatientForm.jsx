import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import AbhaRegister from "./AbhaRegister";
import AbhaVerify from "./AbhaVerify";
import { MdAdd } from "react-icons/md";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

function AddPatientForm({sendDataToAllPatientList}) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();
  const [role, setrole] = useState("");
  const [name, setname] = useState("");
  const { auth } = useAuth();
  useEffect(() => {
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    setname(decoded?.name);
    setrole(decoded?.role);
  }, []);

  const handleDataFromAbhaVerify = (data) => {
    // console.log(data);
    setValue("name", data.auth.patient.name || "");
    setValue("gender", data.auth.patient.gender);
    setValue("mobileNumber", data.auth.patient.identifiers[0].value || "");
    setValue("address", data.auth.patient.address.line || "");
    setValue("town", data.auth.patient.address.district || "");
    setValue("state", data.auth.patient.address.state || "");
    setValue("abhaAddress", data.auth.patient.id || "");
    setValue("linkToken", data.auth.accessToken || "");
    setValue("abhaNumber", "");
    setValue("dataFrom", "AbhaVerify");
    let month = String(data.auth.patient.monthOfBirth).padStart(2, "0");
    let day = String(data.auth.patient.dayOfBirth).padStart(2, "0");
    const dob = `${data.auth.patient.yearOfBirth}-${month}-${day}`;
    // console.log(dob);
    setValue("dob", dob || "");
    setValue("role", role);
    setValue("facultyName", name);
  };

  const handleDataFromAbhaRegister = (data) => {
    // console.log(data);
    setValue("name", data.name || "");
    setValue("gender", data.gender);
    setValue("dob", data.dob || "");
    setValue("mobileNumber", data.mobileNumber || "");
    setValue("address", data.address || "");
    setValue("town", data.districtName || "");
    setValue("state", data.stateName || "");
    setValue("abhaAddress", data.abhaAddress || "");
    setValue("abhaNumber", data.abhaNumber || "");
    setValue("linkToken", data.accessToken || "");
    setValue("dataFrom", "AbhaRegister");
    setValue("role", role);
    setValue("facultyName", name);
  };

  const axiosPrivate = useAxiosPrivate();
  const [states, setStates] = useState([]);
  const [openDialog, setOpen] = React.useState(false);

  const handleOpen = async () => {
    setOpen(!openDialog);
    if (!openDialog) {
      try {
        const response = await axiosPrivate.post(
          "/patient/getLgdStatesList"
        );
        setStates(response.data);
      } catch (error) {
        // console.error("Error fetching data:", error);
      }
    }
  };

  return (
    <div className="">
      <button
        onClick={handleOpen}
        className="inline-flex gap-[15px] px-[1.25rem] m-4 py-[0.625rem] h-[3.375rem] justify-center items-center text-white w-fit hover:bg-[#276059] bg-[#006666] rounded-[10px]"
      >
        <MdAdd className="h-[35px] w-[35px] m-auto" />
        <div className="relative w-fit font-semibold m-auto text-[20px]">
          Add Patients
        </div>
      </button>

      <Dialog open={openDialog} onClose={handleOpen} size="lg">
        <DialogHeader>Add Patient</DialogHeader>
        <div className="h-[1px] bg-[#827F7F82]"></div>
        <DialogBody>
          <div className="2xl:max-h-[43rem] 4xl:max-h-[70rem] overflow-auto p-4">
            <div>
              <p className="font-semibold text-xl ml-4 mt-4 mb-4 text-[#444444]">
                Verify ABHA ID
              </p>
            </div>
            <AbhaVerify sendDataToParent={handleDataFromAbhaVerify} />
            <hr className="h-[2px] bg-black	 mx-2 mt-6 opacity-100" />
            <div>
              <p className="font-semibold text-xl ml-4 mt-4 mb-4 text-[#444444]">
                Creating ABHA ID
              </p>
            </div>
            <AbhaRegister sendDataToParent={handleDataFromAbhaRegister} />
            <hr className="h-[2px] bg-black	 mx-2 mt-6 opacity-100" />
            <div className="grid grid-cols-3 gap-5 text-[#7B7878] font-medium	text-xl mt-8">
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">Patient Name</p>
                  <input
                    className="rounded-md"
                    type="text"
                    name=""
                    id=""
                    {...register("name", { required: "Required" })}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">Mobile Number</p>
                  <input
                    maxLength={10}
                    minLength={10}
                    className="rounded-md"
                    type="text"
                    name=""
                    id=""
                    {...register("mobileNumber", {
                      required: "Required",
                      minLength: {
                        value: 10,
                        message: "Mobile number should be of 10 digits",
                      },
                      maxLength: {
                        value: 10,
                        message: "Mobile number should be of 10 digits",
                      },
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Only Numbers are allowed",
                      },
                    })}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">Email</p>
                  <input
                    className="rounded-md"
                    type="email"
                    name=""
                    id=""
                    {...register("email")}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">Gender</p>
                  <div className="flex gap-10">
                    <select
                      className="w-full rounded-md"
                      name="gender"
                      id=""
                      {...register("gender", { required: "Required" })}
                    >
                      <option disabled defaultValue={true}>
                        Select Gender
                      </option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">DOB</p>
                  <input
                    className="rounded-md"
                    type="date"
                    name=""
                    id=""
                    {...register("dob", {
                      required: "Required",
                    })}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">Blood Group</p>
                  <select
                    className="w-full rounded-md"
                    name="bloodGroup"
                    id=""
                    {...register("bloodGroup", {
                      required: "Required",
                    })}
                  >
                    <option value="" hidden defaultValue={true}>
                      Select Blood Group
                    </option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">Occupation</p>
                  <input
                    className="rounded-md"
                    type="text"
                    name=""
                    id=""
                    {...register("occupation")}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">Family Member Name</p>
                  <input
                    className="rounded-md"
                    type="text"
                    name=""
                    id=""
                    {...register("familyMemberName")}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">Relationship</p>
                  <input
                    className="rounded-md"
                    type="text"
                    name=""
                    id=""
                    {...register("relationship")}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">Address</p>
                  <input
                    className="rounded-md"
                    type="text"
                    name=""
                    id=""
                    {...register("address")}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">State</p>
                  <select
                    className="w-full rounded-md"
                    name="state"
                    id=""
                    {...register("state", {
                      required: "Required",
                    })}
                  >
                    <option value="" hidden defaultValue={true}>
                      Select State
                    </option>
                    {states.map((item, index) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">Town/City</p>
                  <input
                    className="rounded-md"
                    type="text"
                    name=""
                    id=""
                    {...register("town")}
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <p className="text-sm">Pincode</p>
                  <input
                    className="rounded-md"
                    type="text"
                    name=""
                    id=""
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
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
            size="lg"
          >
            <span>Cancel</span>
          </Button>

          <Button
            variant="filled"
            className="bg-[#FFA000]"
            onClick={async () => {
              try {
                const resp = await axiosPrivate.post(
                  "/patient/savePatient",
                  getValues()
                );
                // console.log(resp);
                toast.success(resp.data);
                sendDataToAllPatientList(true);
              } catch (error) {
                // console.log(error);
                toast.error(error.response.data);
              }
              setOpen(!openDialog);
            }}
            size="lg"
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default AddPatientForm;
