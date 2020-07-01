

const mockRequest = () => {

}

const mockResponse = () => {
    res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.header = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockImplementation((result) => {
        res.response = result;
        return res;
    });
    return res;
}

module.exports = {
    mockRequest,
    mockResponse
}