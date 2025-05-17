// CustomerReviews.jsx
import React, { useEffect, useState } from "react";

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data));
  }, []);

  return (
    <div className="grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-3 max-w-[1200px] mx-auto">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl shadow p-4 text-left">
          <p className="text-sm text-gray-700 italic">"{review.content}"</p>
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-semibold">{review.customerName}</span> - {review.date}
          </div>
          <div className="text-yellow-500 mt-1">
            {"★".repeat(review.rating)}
            {"☆".repeat(5 - review.rating)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerReviews;
