const formatTwoDigits = (number) => {
    return number < 10 ? `0${number}` : `${number}`;
}

export const createTimestampString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = formatTwoDigits(date.getMonth() + 1);
    const day = formatTwoDigits(date.getDate());
    const hours = formatTwoDigits(date.getHours());
    const minutes = formatTwoDigits(date.getMinutes());
    const seconds = formatTwoDigits(date.getSeconds());

    return `${day}${month}${year}_${hours}${minutes}${seconds}`;
}