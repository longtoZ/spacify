export const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
};

export const displayFileSize = (size) => {
    if (size >= 1073741824) {
        return `${(size / 1073741824).toFixed(2)} GB`;
    } else if (size >= 1048576) {
        return `${(size / 1048576).toFixed(2)} MB`;
    } else if (size >= 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    } else {
        return `${size} B`;
    }
}

const formatTwoDigits = (number) => {
    return number < 10 ? `0${number}` : `${number}`;
};

export const displayDate = (date) => {

    const lastModifiedDate = new Date(parseInt(date));
    const currentDate = new Date();

    if (currentDate - lastModifiedDate <= 86400000) {
        return `${formatTwoDigits(lastModifiedDate.getHours())}:${formatTwoDigits(lastModifiedDate.getMinutes())}:${formatTwoDigits(lastModifiedDate.getSeconds())}`;
    } else {
        return `${formatTwoDigits(lastModifiedDate.getDate())}/${formatTwoDigits(lastModifiedDate.getMonth() + 1)}/${lastModifiedDate.getFullYear()}`;
    }
}

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();