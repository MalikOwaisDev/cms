import React from "react";
import { CheckCircleIcon, XCircleIcon } from "../Icons";

const PasswordValidator = ({ validation }) => {
  const validationItems = [
    { rule: "length", text: "At least 8 characters" },
    { rule: "number", text: "At least one number (0-9)" },
    { rule: "symbol", text: "At least one symbol (!@#$...)" },
  ];

  return (
    <div className="space-y-2 mt-3 pl-2">
      {validationItems.map((item) => (
        <p
          key={item.rule}
          className={`flex items-center text-sm transition-colors duration-300 ${
            validation[item.rule]
              ? "text-green-600 dark:text-green-400"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {validation[item.rule] ? (
            <span className="mr-2 flex-shrink-0">
              <CheckCircleIcon />
            </span>
          ) : (
            <span className="mr-2 flex-shrink-0">
              <XCircleIcon />
            </span>
          )}
          {item.text}
        </p>
      ))}
    </div>
  );
};

export default PasswordValidator;
