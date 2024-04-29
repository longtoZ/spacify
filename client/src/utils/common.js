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

export const displayDate = (date) => {
    const day = date.substr(0, 2);
    const month = date.substr(2, 2);
    const year = date.substr(4, 4);
    const hour = date.substr(9, 2);
    const minute = date.substr(11, 2);
    const second = date.substr(13, 2);

    const lastModifiedDate = new Date(year, month - 1, day, hour, minute, second);
    const currentDate = new Date();

    if (currentDate - lastModifiedDate <= 86400000) {
        return `${hour}:${minute}:${second}`;
    } else {
        return `${day}/${month}/${year}`;
    }
}
