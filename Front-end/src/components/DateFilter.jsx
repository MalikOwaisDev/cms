import React from "react";
import DatePicker from "react-datepicker";
import { CalendarIcon } from "../Icons";

/**
 * A reusable date filter component.
 * @param {object} props
 * @param {Date|null} props.selectedDate - The currently selected date.
 * @param {function(Date|null): void} props.onDateChange - Callback function for when the date is changed.
 * @param {string} [props.placeholder='Filter by date'] - The placeholder text for the input.
 * @param {string} [props.className=''] - Additional classes for the input element for custom sizing.
 */
const DateFilter = ({
  selectedDate,
  onDateChange,
  placeholder = "Filter by date",
  className = "",
}) => {
  // Default styling for the input, can be extended via props.
  const defaultInputClasses =
    "w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FE4982]";

  return (
    <div className="relative flex-shrink-0">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none z-10">
        <CalendarIcon />
      </span>
      <DatePicker
        selected={selectedDate}
        onChange={onDateChange}
        isClearable
        placeholderText={placeholder}
        className={`${defaultInputClasses} ${className}`}
      />
    </div>
  );
};

export default DateFilter;
