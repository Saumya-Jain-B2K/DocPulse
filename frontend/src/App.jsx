import React from "react";
import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import VerifyOTP from "./pages/VerifyOTP";
import ChatBot from "./pages/ChatBot";
import Feedback from "./pages/Feedback";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { ToastContainer, toast } from "react-toastify";

import MyConsultations from "./pages/MyConsultations";
import ConsultationChat from "./pages/ConsultationChat";

import ChatbotButton from "./components/chatbot/ChatbotButton";
import ChatbotWindow from "./components/chatbot/ChatbotWindow";

const App = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <div className="mx-4 sm:mx-[10%]">
      <ToastContainer />
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/ai-help" element={<ChatBot />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/appointment/:docId" element={<Appointment />} />
        <Route path="/feedback/:appointmentId" element={<Feedback />} />
        <Route path="/my-consultations" element={<MyConsultations />} />
        <Route
          path="/consultation/chat/:chatRoomId"
          element={<ConsultationChat />}
        />
      </Routes>
      <ChatbotButton onClick={() => setIsChatOpen(true)} />

      {isChatOpen && <ChatbotWindow onClose={() => setIsChatOpen(false)} />}
      <Footer />
    </div>
  );
};

export default App;
