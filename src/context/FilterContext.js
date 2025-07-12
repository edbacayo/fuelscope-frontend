import React, { createContext, useState } from 'react';

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = 0; 

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
