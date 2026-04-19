import BaseScreen from "../BaseScreen";
import React, { useState } from "react";
import Calendar from "./Calendar";
import moment from "moment";
import "./index.css";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const CalendarScreen = () => {
  const axiosPrivate = useAxiosPrivate();
  const [AllDoctorList, setAllDoctorList] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState([]);
  const [currDoctorId, setCurrDoctorId] = useState();
  const [event, setEvent] = useState([]);
  const [role, setRole] = useState("");
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  const navigate = useNavigate();
  useEffect(() => {
    // setCurrDoctorId()
    const getAllAppointments = async () => {
      role;
      const resp = await axiosPrivate.get(
        "/patient/appointment/getAllAppointments"
      );
      // console.log(resp.data);
      setAppointmentDetails(resp.data);
      const newEvents = resp.data.map((app) => ({
        start: moment(app.date + "T" + app.time).toDate(),
        end: moment(add15Minutes(app.date + "T" + app.time)).toDate(),
        title: app.notes + " (Dr. " + app.doctorName + ")",
        appointment_id: app.appointment_id,
        status: app.status,
        patientId: app.patientId?.mrn,
        doctorId: app.doctor_id,
        appStatus: app.status,
      }));
      setEvent(newEvents);
    };
    getAllAppointments();

    const getAllDoctorList = async () => {
      const resp = await axiosPrivate.get(
        "/doctor/getAllDoctorList"
      );
      if(decoded?.role === "DOCTOR" || decoded?.role === "HEAD_DOCTOR"){
        const doctor = resp.data.find(doc => doc.registration_number == decoded.registrationNumber)
        // console.log(doctor.doctor_Id)
        setCurrDoctorId(`${doctor.doctor_Id}`);
      }
      setAllDoctorList(resp.data);
    };
    getAllDoctorList();
    setRole(decoded?.role);
    
  }, []);

  useEffect(() => {
    handleEvent();

  }, [currDoctorId]);

  const add15Minutes = (datetimeString) => {
    const dateTime = moment(datetimeString);
    const newDateTime = dateTime.add(15, "minutes");
    return newDateTime.format("YYYY-MM-DDTHH:mm:ss");
  };

  const handleEvent = () => {
    const doctorAppointments = appointmentDetails.filter(
      (appointment) => appointment.doctor_id === currDoctorId
    );
    // console.log(doctorAppointments);
    const newEvents = doctorAppointments.map((app) => ({
      start: moment(app.date + "T" + app.time).toDate(),
      end: moment(add15Minutes(app.date + "T" + app.time)).toDate(),
      title: app.notes + " (Dr. " + app.doctorName + ")",
      appointment_id: app.appointment_id,
      status: app.status,
      patientId: app.patientId?.mrn,
      doctorId: app.doctor_id,
      appStatus: app.status,
    }));
    setEvent(newEvents);
  };

  const handleDoctorChange = (id) => {
    setCurrDoctorId(id);
    handleEvent();
  };

  const handleEventClick = (event) => {
    if(role === "DOCTOR" || role == "HEAD_DOCTOR"){

      navigate(`/patientScreen/${event.patientId}`,{ state: { appointmentId: event.appointment_id,appointmentStatus:event.appStatus } });
      navigate(0);
    }
  };

  const eventStyleGetter = (event) => {
    const colorMap = {};
    AllDoctorList.forEach((doctor, index) => {
      const hue = (360 / AllDoctorList.length) * index;
      colorMap[doctor.doctor_Id] = `hsl(${hue}, 50%, 50%)`;
    });
    const backgroundColor = colorMap[event.doctorId] || "#FFD700"; // Default color
    // console.log(backgroundColor);
    return {
      style: {
        backgroundColor,
      },
    };
  };

  return (
     
        <div className="flex flex-col w-full m-1 bg-white">
          <div className="w-full h-[4.5rem] flex justify-between">
            <div className="flex items-center">
              {role === "STAFF" && (
                <select
                  className="bg-[#006666] rounded-[10px] text-white appearance-none font-semibold text-m"
                  name="doctor"
                  value={currDoctorId}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  defaultValue=""
                >
                  <option disabled value="">
                    Select doctor
                  </option>
                  {AllDoctorList.map((doctor, index) => (
                    <option
                      key={index}
                      className="font-light text-s option-hover"
                      value={doctor.doctor_Id}
                    >
                      {doctor.first_Name} {doctor.last_Name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="w-full p-2">
            <Calendar
              events={event}
              defaultView={"week"}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleEventClick}
              style={{height: 800}}
            />
          </div>
        </div>
  );
};

export default CalendarScreen;
