const errorService = require("../services/error_service");

describe('formatError tests', () => {
    it("should return a error object with just a message property when it is passed a string parameter", () => {
        const error = "This is an error";
        const errorObj = errorService.formatError(error);
        expect(errorObj.message).toBe(error);
    });

    it("should call the findErrorMessage if an object is passed as the paramater", () => {
        // const error = {message: "error message"};
        // //jest.spyOn(errorService, 'findErrorMessage');
        // errorService.formatError(error);
        // expect(errorService.findErrorMessage).toBeCalledWith(error);
    });

    it("should parse the error object that comes in and standardize it", () => {
        const error = {message: "error message"};
        const output = errorService.formatError(error);
        expect(output.message).toBe(error.message);
    });

    it("should call the errorFormattingHook that is passed to formatError function", () => {
        const error = {message: "error message"};
        const errorHook = jest.fn();
        const output = errorService.formatError(error, errorHook);
        expect(errorHook).toBeCalled();
    });

    it("should call the errorFormattingHook that is passed to formatError function", () => {
        const error = {message: "error message"};
        const errorHook = (error, errorObj) => { errorObj.test = true; };
        const output = errorService.formatError(error, errorHook);
        expect(output.test).toBeTruthy();
    });
});

describe('findErrorMessage tests', () => {
    it("should find the message property in the first layer of an object", () => {
        const error = "test";
        const errorObj = {message: error};
        const output = errorService.findErrorMessage(errorObj);
        expect(output).toBe(error);
    });

    it("should find the message property in the second layer of an object", () => {
        const error = "test";
        const errorObj = { secondLayer: {message: error}};
        const output = errorService.findErrorMessage(errorObj);
        expect(output).toBe(error);
    });

    it("should find the error property in the first layer of an object", () => {
        const error = "test";
        const errorObj = {error};
        const output = errorService.findErrorMessage(errorObj);
        expect(output).toBe(error);
    });

    it("should find the error property in the second layer of an object", () => {
        const error = "test";
        const errorObj = { secondLayer: {error}};
        const output = errorService.findErrorMessage(errorObj);
        expect(output).toBe(error);
    });

    it("should find value when maxLevel is specified", () => {
        const error = "test";
        const errorObj = { secondLayer: { thirdLayer: {message: error}}};
        const output = errorService.findErrorMessage(errorObj, 1, 3);
        expect(output).toBeNull();
    });

    it("should not look for value below the maxLevel in an object", () => {
        const error = "test";
        const errorObj = { secondLayer: { thirdLayer: {message: error}}};
        const output = errorService.findErrorMessage(errorObj, 1, 2);
        expect(output).toBeNull();
    });

    it("should respect the current level passed in and not find a value if it is lower than the maxLevel", () => {
        const error = "test";
        const errorObj = { secondLayer: { thirdLayer: {message: error}}};
        const output = errorService.findErrorMessage(errorObj, 2, 3);
        expect(output).toBeNull();
    });

    it("should find the error message when it is not the first property in the object", () => {
        const error = "test";
        const errorObj = { blah: "hello", blah2: "hello again", message: error};
        const output = errorService.findErrorMessage(errorObj);
        expect(output).toBe(error);
    });
});

describe('random findErrorMessage tests', () => {
    function runTestCase(errorObj, expectedValue) {
        it("should work for all the test cases here", () => {
            const output = errorService.findErrorMessage(errorObj);
            expect(output).toBe(expectedValue);
        });
    };
    runTestCase({}, null);
    runTestCase({a: "a", b: "b", c: "c"}, null);
    runTestCase({a: "a", error: "test", c: "c"}, "test");
    runTestCase({a: "a", obj: { level2: { level3: "blah"} }, error: "test", c: "c"}, "test");
    runTestCase({a: "a", obj: { level2: { level3: "blah"} }, c: "c", error: "test"}, "test");
});