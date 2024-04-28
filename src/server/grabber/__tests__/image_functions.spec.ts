import {getExtension, newPathFileName} from '../grab';

describe('Working with files on disk', () => {
    describe('Get remote file extension', () => {
        it('Extracts correctly the extension from img url', () => {
            const listOfUrls: Record<string, string> = {
                'https://i.ytimg.com/vi/i7wveOu5hkQ/hqdefault.jpg?sqp=-oaymwEWCKgBEF5IWvKriqkDCQgBFQAAiEIYAQ==&rs=AOn4CLA0mNDkZLqTBqxyvkrWeUSUI8v_FA': 'jpg',
                'https://i.ytimg.com/vi/-DiPcTkMQrE/3.jpg': 'jpg',
                'https://i.ytimg.com/vi_webp/-DiPcTkMQrE/3.webp': 'webp',
                'https://i.ytimg.com/vi/LF6MUmzOubg/1.jpg': 'jpg',
                'https://ak2.rmbl.ws/s8/1/h/C/8/m/hC8mq.aiEB-small-Far-right-homeschool-mom-wi.jpg': 'jpg',
                'https://ak2.rmbl.ws/s8/6/4/5/C/u/45Cuq.qR4e.jpg': 'jpg',
            }

            for(let url in listOfUrls) {
                expect(getExtension(url)).toBe(listOfUrls[url])
            }
        })
    })
    describe('Prepare path for files with newPathFileName', () => {
        it('Returns correct file when all parameters are set', () => {
            const location = '/Users/opo/Desktop/tmpfiles/media/';
            const listOfParams = [
                {title: 'some_bibi_bo', expect: 'some_bibi_bo.webp'},
                {title: 'some_bibi_bo', expect: 'some_bibi_bo.webp'},
            ]
            for(let test of listOfParams) {
                expect(newPathFileName(test.title)).toBe(location + test.expect);
            }
        })
    })
})