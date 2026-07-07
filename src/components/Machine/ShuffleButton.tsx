import React from "react";
import clsx from "clsx";
import { Button } from "../ui/button";

interface ShuffleButtonProps {
  onClick: () => void;
  isLoading: boolean;
  className?: string;
}

const ShuffleButton: React.FC<ShuffleButtonProps> = ({
  onClick,
  isLoading,
  className,
}) => {
  return (
    <div className={clsx("relative", className)}>
      <Button
        variant={"shuffle"}
        size={"xl"}
        className="w-full"
        onClick={onClick}
        disabled={isLoading}
      >
        SHUFFLE
      </Button>
      <div className="absolute top-0 left-0 mt-3 w-full bg-olive-dark rounded-md h-full -z-10" />
    </div>
  );
};

export default ShuffleButton;
