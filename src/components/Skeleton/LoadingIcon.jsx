// LoadingIcon.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const LoadingIcon = ({ size = "16px" }) => {
  return <FontAwesomeIcon icon={faSpinner} spin style={{ width: size, height: size }} />;
};

export default LoadingIcon;
