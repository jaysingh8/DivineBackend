import ImageKit from '@imagekit/nodejs'
import { config } from '../config/config.js'

const client = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVITE_KEY,
})

export async function uploadFile({ buffer, fileName, folder = "DivineCapture" }) {
    const result = await client.files.upload({
        file: buffer.toString('base64'),
        fileName,
        folder,
        useBase64: true,
    })

    return result
}