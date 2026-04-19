import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

const DeleteDialog = (patient) => {
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;

  const deletePatient = async (patientId) => {
    try {
      const requestBody = {
        patientId: parseInt(patientId),
        role : decoded?.role,
        name : decoded?.name
      };
      const response = await axiosPrivate.post(
        `/patient/deletePatient`,
        requestBody
      );
      // console.log(response.data);
      toast.success(response.data);
      navigate("/");
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
        className="inline-flex justify-center items-center gap-[10px] text-[#b82d2d]"
      >
        {/* <MdAdd className="h-[35px] w-[35px] m-auto" /> */}
        <div className="text-[30px]">
          <MdDelete />
        </div>
      </button>

      <Dialog open={open} onClose={handleOpen} size="xl">
        <DialogHeader>Delete Patient</DialogHeader>
        <div className="h-[1px] bg-[#827F7F82]"></div>

        <DialogBody className="text-red-400">
          <p className="font-semibold text-lg text-center">
            This is very important health information. Any official proceeding
            to delete this data should seek confirmation from the patient. Once
            the data is deleted, it cannot be retrieved.
          </p>
          <hr className="h-[3px] bg-[#7B7878] mx-2 mt-6 opacity-50	" />
        </DialogBody>
        <DialogFooter>
          {role === "head_doctor" && (
            <Button
              variant="filled"
              className="bg-[#FFA000]"
              onClick={() => deletePatient(patient)}
            >
              <span>Delete Patient</span>
            </Button>
          )}
          <Button
            variant="filled"
            className="bg-[#FFA000]"
            onClick={() => deletePatient(patient.patient.mrn)}
          >
            <span>Delete Patient</span>
          </Button>

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
export default DeleteDialog;
