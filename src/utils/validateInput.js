// Validate numeric input to only allow numbers and one decimal point
const validateNumericInput = (value, allowDecimal = true) => {
    // Allow empty string for clearing the input
    if (value === "") return true;

    // For integers (no decimal)
    if (!allowDecimal) {
        return /^\d+$/.test(value);
    }

    // For decimal numbers
    return /^\d*\.?\d*$/.test(value) && !isNaN(parseFloat(value));
};

export default validateNumericInput;