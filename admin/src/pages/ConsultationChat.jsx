import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const backendUrl = "http://localhost:4000";

const ConsultationChat = () => {
  const socketRef = useRef(null);
  const { chatRoomId } = useParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const senderId =
    localStorage.getItem("userId") || localStorage.getItem("doctorId");

  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    socketRef.current = io("http://localhost:4000");

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // for timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  //fetching the messages
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.emit("joinRoom", chatRoomId);

    const handleReceive = (newMessage) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === newMessage._id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    };

    socketRef.current.on("receiveMessage", handleReceive);

    return () => {
      socketRef.current.off("receiveMessage", handleReceive);
    };
  }, [chatRoomId]);

  //refresh messages history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + `/api/user/chat/${chatRoomId}`,
        );

        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchMessages();
  }, [chatRoomId]);

  //useeffect for calculating time
  useEffect(() => {
    const calculateTime = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + `/api/user/consultation/${chatRoomId}`,
        );

        if (data.success) {
          const consultation = data.consultation;

          // 🔥 USE CREATED TIME
          const startTime = consultation.date; // already in ms

          const now = Date.now();

          const endTime = startTime + 15 * 60 * 1000;

          const diff = Math.floor((endTime - now) / 1000);

          console.log("START:", new Date(startTime));
          console.log("NOW:", new Date(now));
          console.log("END:", new Date(endTime));
          console.log("DIFF:", diff);

          setTimeLeft(diff > 0 ? diff : 0);
        }
      } catch (error) {
        console.log(error);
      }
    };

    calculateTime();
  }, [chatRoomId]);

  const sendMessage = () => {
    if (!message.trim() || timeLeft <= 0) return;

    socketRef.current.emit("sendMessage", {
      chatRoomId,
      senderId,
      message,
    });

    setMessage("");
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-semibold mb-4">Consultation Chat</h2>

      <p className="text-red-500 font-semibold">
        Time Left: {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </p>

      {timeLeft <= 0 && (
        <p className="text-red-500 font-semibold mt-2">
          Consultation ended. Chat is closed.
        </p>
      )}

      {/* <div className="h-[300px] overflow-y-scroll border p-3 mb-3">
        {messages.map((msg, i) => (
          <div key={i}>
            <b>{msg.senderId === senderId ? "You" : "Doctor"}:</b> {msg.message}
          </div>
        ))}
      </div> */}

      <div className="h-[400px] overflow-y-scroll border p-4">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === senderId;

          return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[60%] ${
                  isMe ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          disabled={timeLeft <= 0}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border px-3 py-2 w-full"
          placeholder={timeLeft <= 0 ? "Chat closed" : "Type message..."}
        />
        <button
          onClick={sendMessage}
          disabled={timeLeft <= 0}
          className={`px-4 py-2 text-white ${
            timeLeft <= 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#000B6D]"
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ConsultationChat;
