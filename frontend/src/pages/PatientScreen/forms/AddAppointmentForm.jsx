import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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

function AddAppointmentForm({patientId,sendDataToParent}) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();

  const [AllDoctorList, setAllDoctorList] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(!open);

  useEffect(() => {
    const getAllDoctorList = async () => {
      const resp = await axiosPrivate.get(
        "/doctor/getAllDoctorList"
      );
      // console.log(resp);
      setAllDoctorList(resp.data);
    };
    getAllDoctorList();
  }, []);

  const onSubmit = async () => {

    setValue("patient_id", patientId.patientId);

    let doc_reg_no = getValues("doctor").split(";")[0];
    let doctor_id = getValues("doctor").split(";")[1];
    let doctor_name = getValues("doctor").split(";")[2];

    setValue("doctor_id",doctor_id);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    setValue("doctor_name",doctor_name);
    setValue("doctorRegNumber",doc_reg_no);

    let data = getValues();
    // console.log(data);
    try {
      const response = await axiosPrivate.post("/patient/appointment/createAppointment", data);
      // console.log("POST response:", response);
      setOpen(!open);
      toast.success(response.data);
      reset();
      sendDataToParent(true);
    } catch (error) {
      // console.error("Error submitting appointment:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="inline-flex gap-[15px] px-[1.05rem] m-2 py-[0.25rem] h-[2.8rem] justify-center items-center text-white w-fit hover:bg-[#276059] bg-[#006666] rounded-[10px]"
      >
        <MdAdd className="h-[35px] w-[35px] m-auto" />
        <div className="relative w-fit font-semibold m-auto text-[20px]">
          Add Appointment
        </div>
      </button>

      <Dialog open={open} onClose={handleOpen} size="lg">
        <DialogHeader>New Appointment</DialogHeader>
        <div className="h-[1px] bg-[#827F7F82]"></div>
        <DialogBody>
          <div className="2xl:max-h-[43rem] 4xl:max-h-[70rem] overflow-auto p-4">
              <div>
                <p className="text-xl text-[#353535]">Appointment</p>
              </div>
              <hr className="h-[2px] bg-[#7B7878] mt-2 opacity-50	" />
              <div className="grid grid-cols-3  gap-5 text-[#7B7878] font-medium text-xl mt-8">
                <div>
                  <div className="flex flex-col">
                    <p className="text-sm pb-2">Doctor Name</p>
                    <select
                      className="w-full rounded-md"
                      name="doctor_id"
                      id=""
                      {...register("doctor", { required: "Required" })}
                    >
                      <option>Select Doctor</option>
                      {AllDoctorList.map((item, index) => (
                        <option value={`${item.registration_number};${item.doctor_Id};${item.first_Name} ${item.last_Name}`} key={item.doctor_Id}>
                          {item.first_Name} {item.last_Name} 
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col"></div>
                <div className="flex flex-col"></div>
                <div>
                  <div className="flex flex-col">
                    <p className="text-sm pb-2">Scheduled On</p>
                    <input
                      className="rounded-md"
                      type="date"
                      name="scheduledOn"
                      id=""
                      {...register("date", { required: "Required" })}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex flex-col">
                    <p className="text-sm pb-2">Time</p>
                    <input
                      className="rounded-md"
                      type="time"
                      name="time"
                      id=""
                      {...register("time", { required: "Required" })}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex flex-col">
                    {/* <p className="text-sm pb-2">Duration</p>
                    <input
                      className="rounded-md"
                      type="text"
                      name="duration"
                      id=""
                      {...register("duration", { required: "Required" })}
                    /> */}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1  gap-5 text-[#7B7878] font-medium text-xl">
                <div className="flex flex-col mt-4">
                  <p className="text-sm pb-2">Notes</p>
                  <textarea
                    className="rounded-md w-full"
                    name="notes"
                    id=""
                    {...register("notes", { required: "Required" })}
                  />
                </div>
              </div>

              <hr className="h-[3px] bg-[#7B7878] mt-8 mb-2 opacity-50	" />
              <div>
                <p className="text-xl text-[#353535]">Vital Signs</p>
              </div>
              <hr className="h-[2px] bg-[#7B7878] mt-2 mb-2 opacity-50	" />
              <div className="grid grid-cols-4 gap-5 text-[#7B7878] font-medium	text-xl mt-8">
                <div className="flex flex-col">
                  <p className="text-sm pt-2.5">Weight (Kg)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md"
                    type="number"
                    name="weight"
                    id=""
                    {...register("weight", { required: "Required" })}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm pt-2.5">Height (cms)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md"
                    type="number"
                    name="height"
                    id=""
                    {...register("height", { required: "Required" })}
                  />
                </div>

                <div className="flex flex-col">
                  <p className="text-sm pt-2.5">Age</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md"
                    type="number"
                    name="age"
                    id=""
                    {...register("age", { required: "Required" })}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm pt-2.5">Temperature (Degree)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md"
                    type="number"
                    name="temperature"
                    id=""
                    {...register("temperature", { required: "Required" })}
                  />
                </div>

                <div className="flex flex-col">
                  <p className="text-sm pt-2.5">Blood Pressure (mmHg)</p>
                </div>
                <div className="flex flex-col">
                  <div className="flex">
                    <input
                      className="rounded-md"
                      type="number"
                      name="blood_pressure_systolic"
                      id=""
                      placeholder="Systolic"
                      {...register("blood_pressure_systolic", {
                        required: "Required",
                      })}
                    />
                    <p className="text-3xl pt-1 pl-4 pr-5"> / </p>
                    <input
                      className="rounded-md"
                      type="number"
                      name="blood_pressure_distolic"
                      id=""
                      placeholder="Diastolic"
                      {...register("blood_pressure_distolic", {
                        required: "Required",
                      })}
                    />
                  </div>
                </div>
                <div className="flex flex-col"></div>
                <div className="flex flex-col"></div>

                <div className="flex flex-col">
                  <p className="text-sm pt-2.5">Pulse (Heart beats/min)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md"
                    type="number"
                    name="pulse_rate"
                    id=""
                    {...register("pulse_rate", { required: "Required" })}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm pt-2.5">Resp. rate (beats/min)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md"
                    type="number"
                    name="respiration_rate"
                    id=""
                    {...register("respiration_rate", { required: "Required" })}
                  />
                </div>

                <div className="flex flex-col">
                  <p className="text-sm pt-2.5">Total Cholesterol (mg/dL)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md"
                    type="number"
                    name="cholesterol"
                    id=""
                    {...register("cholesterol", { required: "Required" })}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm pt-2.5">Triglycerides (mg/dL)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md"
                    type="number"
                    name="triglyceride"
                    id=""
                    {...register("triglyceride", { required: "Required" })}
                  />
                </div>

                <div className="flex flex-col">
                  <p className="text-sm pt-2.5">Blood Sugar Faster (md/dL)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md"
                    type="number"
                    name="blood_sugar"
                    id=""
                    {...register("blood_sugar", { required: "Required" })}
                  />
                </div>
                <div className="flex flex-col"></div>
                <div className="flex flex-col"></div>
              </div>
              <hr className="h-[3px] bg-[#7B7878] mx-2 mt-6 opacity-50	" />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>

          <Button
            variant="filled"
            className="bg-[#FFA000]"
            onClick={onSubmit}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default AddAppointmentForm;
