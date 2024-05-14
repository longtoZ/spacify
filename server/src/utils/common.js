export const createTimestampInt = () => {
    const date = new Date();
    return date.getTime();
};

export const wait = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
