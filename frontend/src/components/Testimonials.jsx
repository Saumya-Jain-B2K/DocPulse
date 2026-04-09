import React, { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Aarav Sharma",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "Booking appointment was super easy and smooth. Highly recommended!",
  },
  {
    name: "Priya Verma",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4,
    text: "Doctors are very professional and caring. Great experience overall.",
  },
  {
    name: "Rohit Singh",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/men/76.jpg",
    rating: 5,
    text: "The UI is clean and booking took less than a minute. Loved it!",
  },
  {
    name: "Sneha Kapoor",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4,
    text: "Very helpful platform. Saved me a lot of time!",
  },
  {
    name: "Aarav Sharma",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "Booking appointment was super easy and smooth. Highly recommended!",
  },
  {
    name: "Priya Verma",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4,
    text: "Doctors are very professional and caring. Great experience overall.",
  },
  {
    name: "Rohit Singh",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/men/76.jpg",
    rating: 5,
    text: "The UI is clean and booking took less than a minute. Loved it!",
  },
  {
    name: "Sneha Kapoor",
    role: "Patient",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4,
    text: "Very helpful platform. Saved me a lot of time!",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getPosition = (index) => {
    const diff = index - activeIndex;

    if (diff === 0) return "center";
    if (diff === -1 || diff === testimonials.length - 1) return "left";
    if (diff === 1 || diff === -(testimonials.length - 1)) return "right";

    return "hidden";
  };

  return (
    <div className="py-20 text-gray-800 text-center">
      <h1 className="text-3xl font-medium">What Our Users Say</h1>
      <p className="text-sm mt-2 mb-10">
        Real experiences from our happy patients
      </p>

      <div className="relative flex justify-center items-center h-[320px] overflow-hidden">
        {testimonials.map((item, index) => {
          const position = getPosition(index);

          let baseStyle =
            "absolute transition-all duration-500 ease-in-out bg-white rounded-xl shadow-lg p-6 w-[280px] sm:w-[320px]";

          let positionStyle = "";

          if (position === "center") {
            positionStyle =
              "z-20 scale-100 opacity-100 translate-x-0 blur-0";
          } else if (position === "left") {
            positionStyle =
              "z-10 scale-90 opacity-50 -translate-x-[120%] blur-[1px]";
          } else if (position === "right") {
            positionStyle =
              "z-10 scale-90 opacity-50 translate-x-[120%] blur-[1px]";
          } else {
            positionStyle = "opacity-0 scale-75";
          }

          return (
            <div
              key={index}
              className={`${baseStyle} ${positionStyle} hover:-translate-y-2 hover:shadow-xl`}
            >
              {/* Avatar */}
              <img
                src={item.image}
                alt=""
                className="w-14 h-14 rounded-full mx-auto mb-3"
              />

              {/* Name */}
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-xs text-gray-500">{item.role}</p>

              {/* Stars */}
              <div className="flex justify-center gap-1 mt-2">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>

              {/* Text */}
              <p className="text-sm mt-3 text-gray-600">{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Testimonials;