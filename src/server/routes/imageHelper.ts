import sharp from 'sharp';
import axios from 'axios';



export const toLargeThumbnail = async (url: string, location: string) => {
    console.log(`'transform url ${url}  to large and save to location: ${location}`);
    const input = (await axios({ url, responseType: "arraybuffer" })).data as Buffer;

    await cutAndSave(input, location);
}


export const cutAndSave = async (input: Buffer, location: string, size=350) => {
    sharp(input)
        .resize(size)
        .webp()
        .toFile(location)
}
