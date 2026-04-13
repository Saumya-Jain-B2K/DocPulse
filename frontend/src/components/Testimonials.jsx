import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const { backendUrl } = useContext(AppContext);
  const scrollRef = useRef(null);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Responsive cards per view
  useEffect(() => {
    const updateCardsPerView = () => {
      setCardsPerView(window.innerWidth < 640 ? 1 : 3);
    };
    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  useEffect(() => {
    const fetchTopReviews = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/review/top`);
        if (data.success && data.reviews.length > 0) {
          setTestimonials(data.reviews);
        }
      } catch (error) {
        console.error("Error fetching reviews", error);
      }
    };
    fetchTopReviews();
  }, [backendUrl]);

  const realLength = testimonials.length;
  const totalPages = Math.ceil(realLength / cardsPerView);

  // duplicate the array 4 times to create a safe wrapping buffer
  const infiniteTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];

  // Initialize scroll position to the start of the 2nd identical set
  useEffect(() => {
    if (scrollRef.current && infiniteTestimonials.length > 0) {
      // wait for DOM to render the children widths
      setTimeout(() => {
        if (scrollRef.current) {
          const singleSetWidth = scrollRef.current.scrollWidth / 4;
          // Set to 2nd set precisely
          scrollRef.current.scrollLeft = singleSetWidth;
        }
      }, 100);
    }
  }, [realLength]);

  // Handle auto scroll
  useEffect(() => {
    if (realLength <= cardsPerView || !isAutoScrolling) return;

    const interval = setInterval(() => {
      if (scrollRef.current && scrollRef.current.firstChild) {
        const cardWidth = scrollRef.current.firstChild.offsetWidth + 24;
        scrollRef.current.scrollBy({
          left: cardWidth * cardsPerView,
          behavior: "smooth",
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [realLength, cardsPerView, isAutoScrolling]);

  const scrollLeftBtn = () => {
    setIsAutoScrolling(false);
    if (scrollRef.current && scrollRef.current.firstChild) {
      const cardWidth = scrollRef.current.firstChild.offsetWidth + 24;
      scrollRef.current.scrollBy({
        left: -(cardWidth * cardsPerView),
        behavior: "smooth",
      });
    }
  };

  const scrollRightBtn = () => {
    setIsAutoScrolling(false);
    if (scrollRef.current && scrollRef.current.firstChild) {
      const cardWidth = scrollRef.current.firstChild.offsetWidth + 24;
      scrollRef.current.scrollBy({
        left: cardWidth * cardsPerView,
        behavior: "smooth",
      });
    }
  };

  const scrollToDot = (dotIndex) => {
    setIsAutoScrolling(false);
    if (scrollRef.current && scrollRef.current.firstChild) {
      const singleSetWidth = scrollRef.current.scrollWidth / 4;
      const cardWidth = scrollRef.current.firstChild.offsetWidth + 24;

      // Target the identical dot position in the 2nd set
      const offsetInSet = dotIndex * cardsPerView * cardWidth;
      const targetScroll = singleSetWidth + offsetInSet;

      scrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  };

  // Sync scroll position with dots and handle seamless illusion
  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.firstChild && realLength > 0) {
      const { scrollLeft, scrollWidth } = scrollRef.current;
      const singleSetWidth = scrollWidth / 4;

      // Infinite scroll illusion
      // If we scroll past the 3rd set, jump back to the 2nd set
      if (scrollLeft >= singleSetWidth * 2.5) {
        scrollRef.current.style.scrollBehavior = "auto"; // Prevent transition
        scrollRef.current.scrollLeft = scrollLeft - singleSetWidth;
      }
      // If we scroll before the 2nd set, flawlessly jump forward to the 3rd set
      else if (scrollLeft <= singleSetWidth * 0.5) {
        scrollRef.current.style.scrollBehavior = "auto"; // Prevent transition
        scrollRef.current.scrollLeft = scrollLeft + singleSetWidth;
      } else {
        // Safe to smooth scroll naturally in the middle region
        scrollRef.current.style.scrollBehavior = "smooth";
      }

      // Update the active dot indicator
      const cardWidth = scrollRef.current.firstChild.offsetWidth + 24;
      // Calculate which item we are looking at in the current virtual scroll space
      let currentItemIndex = Math.round(scrollLeft / cardWidth);

      // Map it back to the original array bounds (0 to realLength - 1)
      const realItemIndex = currentItemIndex % realLength;

      // Calculate which dot page this item belongs to
      const activeDot = Math.floor(realItemIndex / cardsPerView);
      if (activeIndex !== activeDot) setActiveIndex(activeDot);
    }
  };

  if (realLength === 0) return null;

  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
        Patient Testimonials
      </h1>
      <p className="text-sm sm:text-base mt-3 mb-12 text-gray-500 max-w-lg mx-auto">
        Read what our patients have to say about their experience with our
        verified top-rated doctors.
      </p>

      {/* Slider Container */}
      <div
        className="relative w-full max-w-6xl mx-auto px-4"
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {infiniteTestimonials.map((item, index) => (
            <div
              key={index}
              className="snap-center border border-gray-200 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl p-8 flex flex-col text-left shrink-0 w-[85vw] sm:w-[350px] transition-all hover:shadow-lg"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl leading-none ${i < item.rating ? "text-yellow-400" : "text-gray-200"}`}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Text */}
              <p className="text-base text-gray-600 mb-8 italic flex-grow">
                "{item.text}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4 mt-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.role || "Patient"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-10">
            <button
              onClick={scrollLeftBtn}
              className="w-10 h-10 flex cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#000B6D] hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToDot(index)}
                  className={`transition-all duration-300 rounded-full h-2 ${activeIndex === index ? "bg-[#000B6D] w-6" : "bg-gray-300 w-2 hover:bg-gray-400"}`}
                />
              ))}
            </div>

            <button
              onClick={scrollRightBtn}
              className="w-10 h-10 flex cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#000B6D] hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
