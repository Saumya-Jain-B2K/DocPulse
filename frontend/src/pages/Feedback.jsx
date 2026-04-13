import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Feedback = () => {
  const { appointmentId } = useParams();
  const { token, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [summary, setSummary] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.warn("Please log in to submit your feedback.");
      navigate("/login");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    if (summary.trim() === "") {
      toast.error("Please write a brief summary of your experience.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/review/add`,
        {
          appointmentId,
          rating,
          summary,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        toast.success("Thank you for your valuable feedback!");
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-[80vh] flex items-center justify-center"
    >
      <div className="flex flex-col gap-5 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-xl shadow-[#000B6D]/5 hover:-translate-y-1 transition-all duration-300">
        <p className="text-2xl font-semibold text-[#000B6D]">Doctor Feedback</p>
        <p>We value your experience and use it to improve our platform!</p>

        <div className="w-full">
          <p className="mb-2">Select a Rating</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-3xl cursor-pointer transition-colors duration-200 ${(hover || rating) >= star ? "text-yellow-400" : "text-gray-300"}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="w-full">
          <p>Describe your experience</p>
          <textarea
            className="border border-[#DADADA] rounded w-full p-2 mt-2 h-32 resize-none outline-none focus:border-[#000B6D] transition-colors duration-200"
            placeholder="The doctor was very caring and professional..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          ></textarea>
        </div>

        <button className="bg-[#000B6D] text-white w-full py-3 rounded-md text-base hover:bg-[#000b6dde] transition-colors duration-200">
          Submit Feedback
        </button>
      </div>
    </form>
  );
};

export default Feedback;
