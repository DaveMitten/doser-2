import React from "react";
import Image from "next/image";
import doser from "../../../public/DOSER.svg";

const DoserSVG = () => {
  return (
    <Image
      src={doser}
      alt="Doser"
      fill
      className="object-contain"
    />
  );
};

export default DoserSVG;
