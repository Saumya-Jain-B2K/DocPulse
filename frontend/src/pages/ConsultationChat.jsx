import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const ConsultationChat = () => {
  const { chatRoomId } = useParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const senderId = localStorage.getItem("userId");

  useEffect(() => {
    // join room
    socket.emit("joinRoom", chatRoomId);

    // receive message
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [chatRoomId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendMessage", {
      chatRoomId,
      senderId,
      message,
    });

    setMessage("");
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-semibold mb-4">Consultation Chat</h2>

      <div className="h-[300px] overflow-y-scroll border p-3 mb-3">
        {messages.map((msg, i) => (
          <div key={i}>
            <b>{msg.senderId === senderId ? "You" : "Doctor"}:</b>{" "}
            {msg.message}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border px-3 py-2 w-full"
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-[#000B6D] text-white px-4 py-2"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ConsultationChat;