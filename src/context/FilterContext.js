import React, { createContext, useState } from 'react';

// 🔄 Create a context
export const FilterContext = createContext();

// 🔧 Provider Component
export const FilterProvider = ({ children }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = 0; // making value default to 0 - all months. new Date().getMonth() + 1; // Months are 0-indexed in JavaScript

    // ✅ States for year and month filtering
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    return (
        <FilterContext.Provider
            value={{
                selectedYear,
                setSelectedYear,
                selectedMonth,
                setSelectedMonth,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
};
