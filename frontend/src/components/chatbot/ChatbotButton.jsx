import React from "react";

const ChatbotButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-[#000B6D] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300 z-50"
    >
      💬
    </button>
  );
};

export default ChatbotButton;
