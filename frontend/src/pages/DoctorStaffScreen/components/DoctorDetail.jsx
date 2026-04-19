import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { data } from "autoprefixer";
import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "react-toastify";

const DoctorDetail = (doctor) => {
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  useEffect(() => {
    setRole(decoded?.role.toLowerCase());
  }, []);
  const axiosPrivate = useAxiosPrivate();
  const deleteDoctor = async (doctorId) => {
    const requestBody = {
      doctorId: doctorId,
      role: "doctor",
    };
    try {
      const response = await axiosPrivate.post(
        `/auth/deleteFaculty`,
        requestBody
      );
      toast.success(response.data);
      // console.log(response.data);
      doctor.sendDataToParent(true);
      setOpen(!open);
    } catch (err) {
      // console.log(err);
      toast.error(err);
      if (!err?.response) {
        // console.error("No Server Response");
        toast.error("No Server Response");
      }
    }
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="inline-flex justify-center items-center gap-[10px] rounded-lg
                                          border border-[#787887] bg-[#F5FEF2] text-[20px] text-[#02685A] font-semibold p-2.5"
      >
        {/* <MdAdd className="h-[35px] w-[35px] m-auto" /> */}
        <div className="relative w-fit font-semibold m-auto text-[20px]">
          View
        </div>
      </button>

      <Dialog open={open} onClose={handleOpen} size="xl">
        <DialogHeader>Doctor Details</DialogHeader>
        <div className="h-[1px] bg-[#827F7F82]"></div>

        <DialogBody>
          <div>
            <div className="w-full">
              <div className="mt-5 flex">
                <div className=" w-32 h-32 m-3 mt-0 rounded-full ">
                  <img
                    className="rounded-full mt-0"
                    src="https://wallpapers.com/images/hd/handsome-giga-chad-hmsvijj0ji4dhedr.jpg"
                    alt="profile photo"
                  />
                </div>
                <div className="w-full">
                  <div className="mt-4 ml-8">
                    <p className="text-xl font-semibold text-[#444444]">
                      Dr. {doctor.doctor.first_Name} {doctor.doctor.last_Name}
                    </p>
                  </div>
                  <div className="flex mt-2 ml-8 text-l">
                    <div className="flex-1">
                      <span className="font-semibold flex mr-20 text-[#7B7878]">
                        Registration Number*
                        <p className="ml-6 text-black font-medium">
                          {doctor.doctor.registration_number}
                        </p>
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold flex ml-auto mr-20 text-[#7B7878]">
                        Mobile Number*
                        <p className="ml-6 text-black font-medium">
                          {doctor.doctor.mobile}
                        </p>
                      </span>
                    </div>
                    {/* <div className="flex-1">
                      <span className="font-semibold flex ml-auto mr-20 text-[#7B7878]">
                        Email Address
                        <p className="ml-6 text-black font-medium">
                          rahulb01@gmail.com
                        </p>
                      </span>
                    </div> */}
                  </div>
                  <div className="flex mt-2 ml-8 text-l">
                    <div className="flex-1">
                      <span className="font-semibold flex mr-20 text-[#7B7878]">
                        Date Of Birth(DD/MM/YY)
                        <p className="ml-6 text-black font-medium">
                          {doctor.doctor.dob}
                        </p>
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold flex ml-auto mr-20 text-[#7B7878]">
                        Gender
                        <p className="ml-6 text-black font-medium">
                          {doctor.doctor.gender}
                        </p>
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold flex ml-auto mr-20 text-[#7B7878]">
                        Qualification
                        <p className="ml-6 text-black font-medium">
                          MBBS, MD (Cardiology)
                        </p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr className="h-[3px] bg-[#7B7878] mx-2 mt-6 opacity-50	" />
            <div className="grid grid-cols-3  gap-3  text-[#7B7878] font-semibold text-l  p-5">
              <div className="flex flex-col  item-center">
                <p className=" font-semibold text-center">Address Line</p>
                <p className="text-black text-left font-medium ">
                  {doctor.doctor.address}
                </p>
              </div>
              <div className="flex flex-col item-center">
                <p className=" font-semibold text-center">State</p>
                <p className="text-black text-center font-medium">
                  {doctor.doctor.state}
                </p>
              </div>
              <div className="flex flex-col item-center">
                <p className=" font-semibold text-center">Pincode</p>
                <p className="text-black text-center font-medium">
                  {doctor.doctor.pincode}
                </p>
              </div>
              <div className="flex flex-col col-span-1 px-0">
                <p className=" pb-2 font-semibold text-center">District</p>
                <p className="text-black text-center font-medium">
                  {doctor.doctor.district}
                </p>
              </div>
            </div>
          </div>
          <hr className="h-[3px] bg-[#7B7878] mx-2 mt-6 opacity-50	" />
        </DialogBody>
        <DialogFooter>
          {role === "head_doctor" && (
            <Button
              variant="filled"
              className="bg-[#FFA000]"
              onClick={() => deleteDoctor(doctor.doctor?.doctor_Id)}
            >
              <span>Delete Doctor</span>
            </Button>
          )}
          {/* <Button variant="filled" className="bg-[#FFA000]"
          onClick = {() => deleteDoctor(doctor.doctor?.doctor_Id)}
          >
            <span>Delete Doctor</span>
          </Button> */}

          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
export default DoctorDetail;
