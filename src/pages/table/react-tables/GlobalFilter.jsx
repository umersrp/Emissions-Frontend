import React, { useState, useEffect } from "react";
import Textinput from "@/components/ui/Textinput";

const GlobalFilter = ({ filter, setFilter }) => {
  const [value, setValue] = useState(filter || "");

  useEffect(() => {
    // Only update internal state if prop changes externally
    setValue(filter || "");
  }, [filter]);

  const onChange = (e) => {
    const inputValue = e.target.value;
    setValue(inputValue);
    setFilter(inputValue || undefined);
  };

  return (
    <div>
      <Textinput
        value={value}
        onChange={onChange}
        placeholder="search..."
      />
    </div>
  );
};

export default GlobalFilter;
