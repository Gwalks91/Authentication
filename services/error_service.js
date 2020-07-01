// Probably want to make this into an npm package
const formatError = (error, errorFormattingHook = null) => {
    let errorObj = {
        message: "Default Error"
    };
    if (typeof(error) == "object") {
        errorObj.message = findErrorMessage(error);
    } else if (typeof(error) == "string") {
        errorObj.message = error;
    }
    if (errorFormattingHook !== null) { errorFormattingHook(error, errorObj); }
    return errorObj;
};

const findErrorMessage = (error, level = 0, maxLevel = 1) => {
    for (const prop in error) {
        if (error.hasOwnProperty(prop)) {
            const value = error[prop];
            if ((prop === "message" || 
                prop === "error") && 
                typeof(value) === "string") {
                return value;
            } else if (typeof(value) === "object" && level < maxLevel) {
                const foundValue = findErrorMessage(value, level++);
                if (foundValue !== null) {
                    return foundValue;
                }
            }
        }
    }
    return null;
};

module.exports = {
    formatError,
    findErrorMessage
};