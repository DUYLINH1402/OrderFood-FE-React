import React from "react";
import "../../assets/styles/components/LoadingButton.scss";

export const LoadingButton = ({ isLoading, children, className = "", ...props }) => {
  return (
    <button className={`btn ${className}`} disabled={isLoading} {...props}>
      {isLoading ? (
        <div className="dot-spinner">
          <div className="dot-spinner__dot"></div>
          <div className="dot-spinner__dot"></div>
          <div className="dot-spinner__dot"></div>
          <div className="dot-spinner__dot"></div>
          <div className="dot-spinner__dot"></div>
          <div className="dot-spinner__dot"></div>
          <div className="dot-spinner__dot"></div>
          <div className="dot-spinner__dot"></div>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
