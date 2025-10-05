import React from "react";
import Image from "next/image";
import doser from "../../../public/DOSER.svg";
type Props = {
  width?: number;
  height?: number;
};

const DoserSVG = ({ width = 100, height = 100 }: Props) => {
  return <Image src={doser} alt="Doser" width={width} height={height} />;
};

export default DoserSVG;
