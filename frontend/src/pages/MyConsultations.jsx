import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyConsultations = () => {
  const { backendUrl, token } = useContext(AppContext);

  const [consultations, setConsultations] = useState([]);

  const navigate = useNavigate();

  const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
  };

  // 🔥 GET CONSULTATIONS
  const getUserConsultations = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/user/consultations",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setConsultations(data.consultations ? data.consultations.reverse() : []);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // 🔥 CANCEL CONSULTATION
  const cancelConsultation = async (consultationId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-consultation",
        { consultationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserConsultations();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserConsultations();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Consultations
      </p>

      <div>
        {consultations.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img className="w-32 bg-indigo-50" src={item.docData.image} alt="" />
            </div>

            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>

              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>

              <p className="text-xs mt-1">
                <span className="text-sm font-medium">Date & Time:</span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-2 justify-end">

              {/* JOIN CHAT */}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => navigate(`/consultation/chat/${item.chatRoomId}`)}
                  className="text-sm text-white bg-green-600 px-4 py-2 rounded"
                >
                  Join Chat
                </button>
              )}

              {/* CANCEL */}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelConsultation(item._id)}
                  className="text-sm border py-2 rounded hover:bg-red-600 hover:text-white"
                >
                  Cancel Consultation
                </button>
              )}

              {/* STATUS */}
              {item.cancelled && <p className="text-red-500">Cancelled</p>}
              {item.isCompleted && <p className="text-green-500">Completed</p>}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyConsultations;