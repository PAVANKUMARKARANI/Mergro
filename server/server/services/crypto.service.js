import crypto from "crypto-js";
import config from '../config/config'


const encrypting = async (body) => {
    let encrypt = await crypto.AES.encrypt(body, config.sourceKey);
    body = encrypt.toString();
    return body;
}

const decrypting = async (body) => {
    let decrypt = await crypto.AES.decrypt(body.toString(), config.sourceKey);
    body = decrypt.toString(crypto.enc.Utf8)
    return body
}

export default {
    encrypting,
    decrypting
};