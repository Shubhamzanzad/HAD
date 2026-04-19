import { useState, useEffect, useRef } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { toast } from "react-toastify";

import React, { Suspense } from "react";

import PdfViewer from "../../../utilComponents/PdfViewer";

function AddRecords({ patientId, appointment_id, sendDataToParent, status }) {
  const axiosPrivate = useAxiosPrivate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!appointment_id)
      sendDataToParent("Select an appointment to view records");
    // console.log("patient", patientId.patientId, "app", appointment_id);
    try {
      const fetchData = async () => {
        const path = `/patient/appointment/getPatientVitals?id=${appointment_id}`;
        const resp = await axiosPrivate.get(path);
        // console.log(resp.data, "hello");
        setVitals(resp.data);
      };
      fetchData();
    } catch (error) {
      // console.log(error);
    }

    const getOpData = async () => {
      const path = `/patient/appointment/getOpData?id=${appointment_id}`;
      try {
        const response = await axiosPrivate.get(path);
        const data = response.data;
        setFileBase64Data(data.fileData);
        setFileName(data.fileName);
        setfileMediaType(data.fileMediaType);
        setobservations(data.observation);
      } catch (error) {
        // console.error("Error fetching data:", error);
        toast.error("Error Fetching op data", error);
      }
    };

    if (status) getOpData();

    const getPrescription = async () => {
      const path = `/patient/appointment/getPrescription`;
      const requestBody = {
        appointment_id: appointment_id,
      };
      const resp = await axiosPrivate.post(path, requestBody);
      // console.log(resp.data, "Prescription data");
      setPrescription(resp.data);
    };
    getPrescription();
  }, []);

  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);

  const [prescription, setPrescription] = useState([]);
  const [drug, setDrug] = useState("");
  const [dosage, setDosage] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [duration, setDuration] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [Weight, setWeight] = useState(0);
  const [Age, setAge] = useState(0);
  const [Systolic, setSystolic] = useState(0);
  const [Diastolic, setDiastolic] = useState(0);
  const [Pulse, setPulse] = useState(0);
  const [Cholestrol, setCholestrol] = useState(0);
  const [Sugar, setSugar] = useState(0);
  const [Height, setHeight] = useState(0);
  const [Temperature, setTemperature] = useState(0);
  const [RespirationRate, setRespirationRate] = useState(0);
  const [Triglycerides, setTriglycerides] = useState(0);
  const [observations, setobservations] = useState("");
  const [fileBase64Data, setFileBase64Data] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileMediaType, setfileMediaType] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  function handleAddPrescription() {
    if (
      drug !== "" &&
      dosage !== 0 &&
      duration !== 0 &&
      frequency !== 0 &&
      instructions !== ""
    ) {
      const newPrescription = {
        drug: drug,
        dosage: dosage,
        duration: duration,
        frequency: frequency,
        instructions: instructions,
      };

      setPrescription((prescription) => [...prescription, newPrescription]);
    }
    setDosage(0);
    setDrug("");
    setDuration(0);
    setFrequency(0);
    setInstructions("");
  }

  const linkCareContext = () => {
    try {
      const completeAppointment = async () => {
        const path = `/patient/appointment/completeAppointment`;
        const requestBody = {
          appointmentId: appointment_id,
          prescription: prescription,
          patientId: parseInt(patientId.patientId),
          observations: observations,
          fileDescription: fileDescription,
        };

        const formData = new FormData();
        formData.append("file", file);
        formData.append("requestBody", JSON.stringify(requestBody));
        // console.log(requestBody);
        const resp = await axiosPrivate.post(path, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        // console.log(resp.data, "Care Context Response");
      };
      completeAppointment();
    } catch (error) {
      // console.log(error);
      toast.error(error);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosPrivate.post(
        "/patient/appointment/uploadFile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data);
    } catch (error) {
      setMessage("Failed to upload file");
    }
  };

  const handleRemovePrescription = (index) => {
    const updatedPrescriptions = prescription.filter((_, i) => i !== index);
    setPrescription(updatedPrescriptions);
  };

  function handleChangeDrug(event) {
    setDrug(event.target.value);
  }

  function handleChangeDosage(event) {
    setDosage(event.target.value);
  }

  function handleChangeFrequency(event) {
    setFrequency(event.target.value);
  }

  function handleChangeDuration(event) {
    setDuration(event.target.value);
  }

  function handleChangeInstructions(event) {
    setInstructions(event.target.value);
  }

  const changeObservations = (e) => {
    setobservations(e.target.value);
  };

  const setVitals = (data) => {
    setWeight(data.weight || 0);
    setCholestrol(data.cholesterol || 0);
    setDiastolic(data.blood_pressure_distolic || 0);
    setAge(data.age || 0);
    setHeight(data.height || 0);
    setPulse(data.pulse_rate || 0);
    setSystolic(data.blood_pressure_systolic || 0);
    setSugar(data.blood_sugar || 0);
    setTemperature(data.temperature || 0);
    setTriglycerides(data.triglyceride || 0);
    setRespirationRate(data.respiration_rate || 0);
  };
  return (
    <div className="flex flex-col">
      <div className="">
        <div className="border mx-3 my-4 border-[#006666] rounded-md border-l-4 ">
          <div className="m-s:max-h-[350px] md:max-h-[400px] lg:max-h-[450px] 2xl:max-h-[470px] 3xl:max-h-[630px] 4xl:max-h-[850px] flex flex-col overflow-auto">
            <div className="">
              <p className="font-semibold ml-4 mt-4 text-lg">Vital Signs</p>

              <hr className="h-[2px] bg-[#7B7878] mt-2 mb-2 opacity-50	" />
              <div className="grid grid-cols-4 gap-5 text-[#7B7878] font-medium	text-xl mt-8">
                <div className="flex flex-col">
                  <p className="text-sm pt-2.5 px-6">Weight (Kg)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md text-gray-800 cursor-not-allowed bg-gray-200"
                    disabled={true}
                    type="number"
                    name="weight"
                    value={Weight}
                  />
                </div>
                <div className="flex flex-col px-6">
                  <p className="text-sm pt-2.5">Height (cms)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md mr-8 text-gray-800 cursor-not-allowed bg-gray-200"
                    disabled={true}
                    type="number"
                    name="height"
                    value={Height}
                  />
                </div>

                <div className="flex flex-col px-6">
                  <p className="text-sm pt-2.5">Age</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md text-gray-800 cursor-not-allowed bg-gray-200"
                    disabled={true}
                    type="number"
                    name="age"
                    value={Age}
                  />
                </div>
                <div className="flex flex-col px-6">
                  <p className="text-sm pt-2.5">Temperature (Degree)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md mr-8 text-gray-800 cursor-not-allowed bg-gray-200"
                    disabled={true}
                    type="number"
                    name="temperature"
                    value={Temperature}
                  />
                </div>

                <div className="flex flex-col px-6">
                  <p className="text-sm pt-2.5">Blood Pressure (mmHg)</p>
                </div>
                <div className="flex flex-col">
                  <div className="flex">
                    <input
                      className="rounded-md text-gray-800 cursor-not-allowed bg-gray-200"
                      disabled={true}
                      type="number"
                      name="blood_pressure_systolic"
                      value={Diastolic}
                      placeholder="Systolic"
                    />
                    <p className="text-3xl pt-1 pl-4 pr-5"> / </p>
                    <input
                      className="rounded-md text-gray-800 cursor-not-allowed bg-gray-200"
                      disabled={true}
                      type="number"
                      name="blood_pressure_distolic"
                      value={Systolic}
                      placeholder="Diastolic"
                    />
                  </div>
                </div>
                <div className="flex flex-col"></div>
                <div className="flex flex-col"></div>

                <div className="flex flex-col px-6">
                  <p className="text-sm pt-2.5">Pulse (Heart beats/min)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md text-gray-800 cursor-not-allowed bg-gray-200"
                    disabled={true}
                    type="number"
                    name="pulse_rate"
                    value={Pulse}
                  />
                </div>
                <div className="flex flex-col px-6">
                  <p className="text-sm pt-2.5">Resp. rate (beats/min)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md mr-8 text-gray-800 cursor-not-allowed bg-gray-200"
                    disabled={true}
                    type="number"
                    name="respiration_rate"
                    value={RespirationRate}
                  />
                </div>

                <div className="flex flex-col px-6">
                  <p className="text-sm pt-2.5">Total Cholesterol (mg/dL)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md text-gray-800 cursor-not-allowed bg-gray-200"
                    disabled={true}
                    type="number"
                    name="cholesterol"
                    value={Cholestrol}
                  />
                </div>
                <div className="flex flex-col px-6">
                  <p className="text-sm pt-2.5">Triglycerides (mg/dL)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md mr-8 text-gray-800 cursor-not-allowed bg-gray-200"
                    disabled={true}
                    type="number"
                    name="triglyceride"
                    value={Triglycerides}
                  />
                </div>

                <div className="flex flex-col px-6">
                  <p className="text-sm pt-2.5">Blood Sugar Faster (md/dL)</p>
                </div>
                <div className="flex flex-col">
                  <input
                    className="rounded-md text-gray-800 cursor-not-allowed bg-gray-200"
                    disabled={true}
                    type="number"
                    name="blood_sugar"
                    value={Sugar}
                  />
                </div>
                <div className="flex flex-col"></div>
                <div className="flex flex-col"></div>
              </div>
              <div className="mx-6 mt-6" />
              {!status ? (
                <>
                  <hr className="bg-[#7B7878]" />
                  <p className="font-semibold text-lg ml-4 my-4">
                    Prescription
                  </p>
                  <hr className="mx-4 bg-[#7B7878]"></hr>
                </>
              ) : (
                <>
                  {prescription.length === 0 ? (
                    <></>
                  ) : (
                    <>
                      <hr className="bg-[#7B7878]" />
                      <p className="font-semibold text-lg ml-4 my-4">
                        Prescription
                      </p>
                      <hr className="mx-4 bg-[#7B7878]" />
                    </>
                  )}
                </>
              )}
              <div>
                {prescription.map((p, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap pl-4 text-[#7B7878] font-medium text-l w-full">
                      <div className="w-1/4 px-4">
                        <p>Drug</p>
                        <input
                          className="rounded-md w-72 mr-32 w-full bg-gray-200 text-gray-800 cursor-not-allowed"
                          disabled={true}
                          type="text"
                          value={p.drug}
                        />
                      </div>
                      <div className=" w-1/4 px-4">
                        <p>Dosage</p>
                        <input
                          className="rounded-md w-72 mr-32 w-full text-gray-800 cursor-not-allowed bg-gray-200"
                          disabled={true}
                          type="number"
                          value={p.dosage}
                        />
                      </div>
                      <div className=" w-1/4 px-4">
                        <p>Frequency</p>
                        <input
                          className="rounded-md w-72 mr-32 w-full text-gray-800 cursor-not-allowed bg-gray-200"
                          disabled={true}
                          type="number"
                          value={p.frequency}
                        />
                      </div>
                      <div className=" w-1/4 px-4">
                        <p>Duration</p>
                        <input
                          className="rounded-md w-72 w-full text-gray-800 cursor-not-allowed bg-gray-200"
                          disabled={true}
                          type="number"
                          value={p.duration}
                        />
                      </div>
                    </div>
                    <div className="flex items-center text-md font-semibold text-[#7B7878] w-full">
                      <div className="rounded-md my-2 pl-8 mr-32 w-2/3">
                        <p>Instructions</p>
                        <input
                          className="my-2 rounded-md w-full text-gray-800 cursor-not-allowed bg-gray-200"
                          disabled={true}
                          type="text"
                          placeholder="Add Instructions"
                          value={p.instructions}
                        />
                      </div>
                      <div>
                        {!status ? (
                          <div className="bg-white ml-2 flex align-center justify-center">
                            <button
                              className="cursor-hover my-8"
                              onClick={() => handleRemovePrescription(index)}
                            >
                              <RiDeleteBinLine className="text-[#e90000] text-4xl" />
                            </button>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                    <br />
                    <hr className="bg-[#7B7878] mx-4" />
                  </div>
                ))}
              </div>
              <div>
                {!status ? (
                  <>
                    <button
                      className="border border-black my-5 mx-4 px-8 py-1.5 text-lg rounded-md"
                      onClick={handleAddPrescription}
                    >
                      + Add
                    </button>
                    <div className="flex text-[#7B7878] font-medium	text-l">
                      <div className="flex-1 w-1/4 px-4">
                        <p className="pl-4 pr-40 mr-52">Drug</p>
                        <input
                          className="ml-4 w-full rounded-md"
                          type="text"
                          value={drug}
                          onChange={(e) => handleChangeDrug(e)}
                        />
                      </div>
                      <div className="flex-1 w-1/4 px-4">
                        <p>Dosage</p>
                        <input
                          className="ml-4 w-full rounded-md"
                          type="number"
                          value={dosage}
                          onChange={(e) => handleChangeDosage(e)}
                        />
                      </div>
                      <div className="flex-1 w-1/4 px-4">
                        <p>Frequency</p>
                        <input
                          className="ml-4 w-full rounded-md"
                          type="number"
                          value={frequency}
                          onChange={(e) => handleChangeFrequency(e)}
                        />
                      </div>
                      <div className="flex-1 w-1/4 px-4">
                        <p>Duration</p>
                        <input
                          className="ml-4 w-full rounded-md "
                          type="number"
                          value={duration}
                          onChange={(e) => handleChangeDuration(e)}
                        />
                      </div>
                    </div>
                    <input
                      className="pl-4 my-6 ml-8 rounded-md w-2/3"
                      type="text"
                      placeholder="Add Instructions"
                      value={instructions}
                      onChange={(e) => handleChangeInstructions(e)}
                    />

                    <hr className="bg-[#7B7878]" />
                    <p className="font-semibold text-lg ml-4 my-4">
                      Add Observations
                    </p>
                    <hr className="bg-[#7B7878] mx-4" />
                    <input
                      type="text"
                      className="pl-4 my-6 ml-8 rounded-md w-2/3"
                      placeholder="Add Observations"
                      onChange={(e) => changeObservations(e)}
                    />

                    <hr className="bg-[#7B7878]" />
                    <p className="font-semibold text-lg ml-4 my-4">Add Files</p>
                    <hr className="bg-[#7B7878] mx-4" />

                    <hr className="mx-4 bg-[#7B7878]" />
                    <div className="flex mx-4 my-6 ">
                      <input type="file" onChange={handleFileChange} />
                    </div>

                    <input
                      className="ml-4 pl-4 rounded-md w-2/3"
                      type="text"
                      placeholder="Add File Description"
                      onChange={(e) => setFileDescription(e.target.value)}
                    />
                    <hr className="bg-[#7B7878] mx-4 my-6" />
                    <div className="flex">
                      <div className="ml-auto my-4">
                        <button className="w-32 h-10  border border-black rounded-md">
                          Cancel
                        </button>
                        <button
                          className="bg-[#FFA000] text-white ml-4 w-32 h-10 mr-6 border border-[#a18042] rounded-md"
                          onClick={() => linkCareContext()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <hr className="bg-[#7B7878]" />
                    <p className="font-semibold text-lg ml-4 my-4">
                      Observations
                    </p>
                    <hr className="bg-[#7B7878] mx-4" />
                    <input
                      type="text"
                      className="pl-4 my-6 ml-8 rounded-md w-2/3 text-gray-800 cursor-not-allowed bg-gray-200"
                      disabled={true}
                      value={observations}
                    />
                    <hr className="bg-[#7B7878]" />

                    <Dialog open={open} handler={handleOpen} size="lg">
                      <DialogHeader>Attachment</DialogHeader>
                      <div className="h-[1px] bg-[#827F7F82]"></div>
                      <DialogBody>
                        {fileMediaType === "image/jpeg" ? (
                          <img
                            src={`data:image/jpeg;base64,${fileBase64Data}`}
                          />
                        ) : (
                          <PdfViewer file={fileBase64Data} />
                        )}
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
                      </DialogFooter>
                    </Dialog>

                    <div className="flex justify-between items-center mx-4 ">
                      <p className="font-semibold text-lg ml-4 my-4">Files</p>
                      <button
                        onClick={handleOpen}
                        className="inline-flex gap-[15px] px-[1.05rem]  py-[0.25rem] h-[2.8rem] justify-center items-center text-white w-fit hover:bg-[#276059] bg-[#006666] rounded-[10px]"
                      >
                        <div className="relative w-fit font-semibold m-auto text-[20px]">
                          View File
                        </div>
                      </button>
                    </div>
                    <hr className="bg-[#7B7878] mx-4 my-4" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AddRecords;
