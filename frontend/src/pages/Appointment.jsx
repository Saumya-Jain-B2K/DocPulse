import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);

  const navigate = useNavigate();

  // 🔥 MAIN FLAG (Appointment vs Consultation)
  const [isConsultation, setIsConsultation] = useState(false);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  // get doctor info
  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const [docReviews, setDocReviews] = useState([]);
  const [docRating, setDocRating] = useState(0);

  const fetchDoctorReviews = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/review/doctor/${docId}`,
      );
      if (data.success) {
        setDocReviews(data.reviews);
        setDocRating(data.averageRating);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //normal appointments slots
  const getAvailableSlots = async () => {
    setDocSlots([]);

    // getting current date
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      //getting date with index
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      //setting end time of the date with index
      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      //setting hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10,
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime;

        const isSlotAvailable = docInfo?.slots_booked?.[slotDate]?.includes(
          slotTime,
        )
          ? false
          : true;

        if (isSlotAvailable) {
          //add slot to array
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        //increment current time by 30 mins
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  // 🔥 CONSULTATION SLOTS (ONLY 3 HOURS)
  const getConsultationSlots = () => {
    let today = new Date();

    let currentDate = new Date(today);

    // 👉 5PM to 8PM
    currentDate.setHours(17, 0, 0, 0);

    let endTime = new Date(today);
    endTime.setHours(20, 0, 0, 0);

    let timeSlots = [];

    while (currentDate < endTime) {
      let formattedTime = currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      timeSlots.push({
        datetime: new Date(currentDate),
        time: formattedTime,
      });

      currentDate.setMinutes(currentDate.getMinutes() + 30);
    }

    // 🔥 ONLY ONE DAY
    setDocSlots([timeSlots]);
  };

  // 🔹 BOOK APPOINTMENT
  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login first");
      return navigate("/login");
    }

    if (!slotTime) {
      toast.error("Select a time slot");
      return;
    }

    try {
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔥 BOOK CONSULTATION
  const bookConsultation = async () => {
    if (!token) {
      toast.warn("Login first");
      return navigate("/login");
    }

    if (!slotTime) {
      toast.error("Select a time slot");
      return;
    }

    try {
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-consultation",
        { docId, slotDate, slotTime },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/my-consultations");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDocInfo();
    fetchDoctorReviews();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      if (isConsultation) {
        getConsultationSlots();
      } else {
        getAvailableSlots();
      }
    }
  }, [docInfo, isConsultation]);

  // useEffect(() => {
  //   console.log(docSlots);
  // }, [docSlots]);

  return (
    docInfo && (
      <div>
        {/* Doctor Details */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-[#000B6D] w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            {/* Doctor Info like name, degree and experience */}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            {docRating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm font-medium text-gray-700">
                  {docRating} / 5
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({docReviews.length} reviews)
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience}
              </button>
            </div>

            {/* Doctors About */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About
                <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* SLOT SECTION */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          {/* 🔥 DYNAMIC TITLE */}
          <p>{isConsultation ? "Consultation Slots" : "Booking Slots"}</p>

          {/* DATE */}
          <div className="flex gap-3 mt-4 overflow-x-scroll">
            {docSlots.map((item, index) => (
              <div
                key={index}
                onClick={() => setSlotIndex(index)}
                className={`py-6 min-w-16 rounded-full text-center cursor-pointer ${
                  slotIndex === index ? "bg-[#000B6D] text-white" : "border"
                }`}
              >
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))}
          </div>

          {/* TIME */}
          <div className="flex gap-3 mt-4 overflow-x-scroll">
            {docSlots[slotIndex]?.map((item, index) => (
              <p
                key={index}
                onClick={() => setSlotTime(item.time)}
                className={`px-5 py-2 rounded-full cursor-pointer ${
                  item.time === slotTime
                    ? "bg-[#000B6D] text-white"
                    : "border text-gray-400"
                }`}
              >
                {item.time}
              </p>
            ))}
          </div>

          {/* 🔹 APPOINTMENT BUTTON */}
          <button
            onClick={() => {
              setIsConsultation(false);
              setSlotTime("");
              setSlotIndex(0);
              bookAppointment();
            }}
            className="bg-[#000B6D] text-white px-14 py-3 rounded-full my-6"
          >
            Book Appointment
          </button>

          {/* 🔹 SWITCH TO CONSULTATION */}
          <button
            onClick={() => {
              setIsConsultation(true);
              setSlotTime("");
              setSlotIndex(0);
            }}
            className="bg-green-600 text-white px-14 py-3 rounded-full my-2"
          >
            Start Consultation
          </button>

          {/* 🔥 CONFIRM CONSULTATION */}
          {isConsultation && (
            <button
              onClick={bookConsultation}
              className="bg-green-700 text-white px-14 py-3 rounded-full my-2"
            >
              Confirm Consultation
            </button>
          )}
        </div>

        {/* Patient Reviews Section */}
        <div className="sm:ml-72 sm:pl-4 mt-8">
          <p className="font-medium text-gray-700 text-lg mb-4">
            Patient Reviews
          </p>
          {docReviews.length > 0 ? (
            <div className="flex flex-col gap-4">
              {docReviews.map((review, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={review.image}
                      alt={review.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {review.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            ★
                          </span>
                        ))}
                        {review.date && (
                          <span className="text-gray-400 ml-2">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No reviews yet for this doctor.
            </p>
          )}
        </div>

        {/* listing related doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
