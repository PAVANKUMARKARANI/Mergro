const RandExp = require('randexp');


export const generateMatchingString = (regexPattern) => {
    const randexp = new RandExp(regexPattern);
    return randexp.gen();
};

export const generateMinLengthString = (n)=>{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    const randomLength = Math.floor(Math.random() * n);
    let randomString = '';
    for (let i = 0; i < randomLength; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomString;
}

export const generateMaxLengthString = (n)=>{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
     const randomLength = Math.floor(Math.random() * 10) + n + 1;
    let randomString = '';
    for (let i = 0; i < randomLength; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomString;
}

export const generateRandomNumberString = ()=>{
    let length = Math.floor(Math.random() * 10) + 1;
    let result = '';
    for (let i = 0; i < length; i++) {
        let randomNum = Math.floor(Math.random() * 10);
        result += randomNum;
    }
    return result;
}

export const generateRandomAlphabets = ()=>{
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let length = Math.floor(Math.random() * 10) + 1;
    let result = '';
    for (let i = 0; i < length; i++) {
        let randomIndex = Math.floor(Math.random() * alphabet.length);
        result += alphabet[randomIndex];
    }
    return result;
}