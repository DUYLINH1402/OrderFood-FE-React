// NewsSection.jsx
import React, { useEffect, useState } from "react";
import LazyImage from "./LazyImage";

const NewsSection = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => setNews(data));
  }, []);

  return (
    <div className="grid grid-cols-1 min-[520px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-3 max-w-[1200px] mx-auto">
      {(news || []).map((item) => (
        <div key={item.id} className="bg-white rounded-xl shadow-md p-4 flex gap-4">
          <LazyImage
            src={item.imageUrl}
            alt={item.title}
            className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
          />
          <div className="text-left">
            <h3 className="font-semibold text-lg text-green-600">{item.title}</h3>
            <p className="text-sm text-gray-700 line-clamp-3">{item.summary}</p>
            <p className="text-xs text-gray-400 mt-1">Ngày đăng: {item.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsSection;
