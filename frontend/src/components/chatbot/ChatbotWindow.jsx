import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const chatbotData = [
  {
    question: "How to book an appointment?",
    answer:
      "You can book an appointment by selecting a doctor from our doctors page.",
    ctaText: "Go to Doctors",
    route: "/doctors",
  },
  {
    question: "Is first consultation free?",
    answer:
      "Yes, the first consultation with a doctor is free. Charges may apply after that.",
    ctaText: "View Doctors",
    route: "/doctors",
  },
  {
    question: "How to view my appointments?",
    answer: "You can view all your appointments in your dashboard.",
    ctaText: "My Appointments",
    route: "/my-appointments",
  },
  {
    question: "How to contact a doctor?",
    answer: "You can contact a doctor after booking a consultation.",
    ctaText: "Find Doctors",
    route: "/doctors",
  },
  {
    question: "How to edit my profile?",
    answer: "You can update your profile anytime from your profile section.",
    ctaText: "Go to Profile",
    route: "/my-profile",
  },
  {
    question: "How to cancel appointment?",
    answer:
      "Go to My Appointments and select the appointment you want to cancel.",
    ctaText: "My Appointments",
    route: "/my-appointments",
  },
  {
    question: "Not sure which doctor to choose?",
    answer:
      "Our AI assistant will ask about your symptoms and suggest the best doctors for you.",
    ctaText: "Try AI Assistant",
    route: "/ai-help",
  },
  {
    question: "How to join my consultation chat?",
    answer:
      "You can view your consultations and join the chat with your doctor from the My Consultations section.",
    ctaText: "Go to My Consultations",
    route: "/my-consultations",
  },
];

const ChatbotWindow = ({ onClose }) => {
  const navigate = useNavigate();
  const [isEnded, setIsEnded] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Welcome to DocPulse 💙",
    },
    {
      sender: "bot",
      text: "How can I help you today?",
    },
  ]);

  const [showOptions, setShowOptions] = useState(true);

  const handleQuestionClick = (item) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: item.question },
      { sender: "bot", text: item.answer, cta: item },
      { sender: "bot", text: "Do you have any other query?" },
    ]);

    setShowOptions(false);
  };

  const handleOption = (type) => {
    if (type === "yes") {
      setMessages((prev) => [...prev, { sender: "user", text: "Yes" }]);
      setShowOptions(true);
      setIsEnded(false);
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: "No" },
        { sender: "bot", text: "Thanks for using DocPulse 💙" },
      ]);

      setShowOptions(false);
      setIsEnded(true); // ✅ THIS IS THE KEY FIX
    }
  };

  useEffect(() => {
    const container = document.querySelector(".chat-scroll");
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-24 sm:right-6 w-full sm:w-[360px] h-[85vh] sm:h-auto sm:max-h-[80vh] bg-white rounded-none sm:rounded-2xl shadow-xl border z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#000B6D] text-white px-4 py-3 flex justify-between items-center">
        <p className="font-semibold text-sm sm:text-base">DocPulse Assistant</p>
        <button onClick={onClose} className="text-xl">
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-3 text-sm chat-scroll">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
              msg.sender === "user"
                ? "bg-[#000B6D] text-white self-end"
                : "bg-gray-100 text-gray-800 self-start"
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{msg.text}</p>

            {/* CTA Button */}
            {msg.cta && (
              <button
                onClick={() => {
                  navigate(msg.cta.route);
                  onClose();
                }}
                className="mt-2 text-xs bg-[#000B6D] text-white px-3 py-1.5 rounded-full hover:opacity-90"
              >
                {msg.cta.ctaText}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Options */}
      <div className="p-3 border-t bg-white">
        {showOptions ? (
          <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
            {chatbotData.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(item)}
                className="text-left text-sm border px-3 py-2.5 rounded-lg hover:bg-gray-100 transition"
              >
                {item.question}
              </button>
            ))}
          </div>
        ) : (
          messages[messages.length - 1]?.text !==
            "Thanks for using DocPulse 💙" && (
            <div className="flex gap-2 flex-col sm:flex-row">
              <button
                onClick={() => handleOption("yes")}
                className="flex-1 bg-[#000B6D] text-white py-2 rounded-lg"
              >
                Yes
              </button>
              <button
                onClick={() => handleOption("no")}
                className="flex-1 border py-2 rounded-lg"
              >
                No
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ChatbotWindow;
