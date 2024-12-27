import { extractMediaMetaFromUrl } from "../../routes/mediaHelper";

describe("mediaHelper", () => {
    describe("facebook", () => {
        it("should return the id from a facebook url", () => {
            const url = "https://www.facebook.com/watch/?v=10157009850766200";
            const result = extractMediaMetaFromUrl(url);
            expect(result).toEqual({
                type: "facebook",
                id: "10157009850766200",
            });
        });
        it("should return the id from a fb.watch url", () => {
            const url = "https://fb.watch/3k7Jv2k1pQ/";
            const result = extractMediaMetaFromUrl(url);
            expect(result).toEqual({ type: "facebook", id: "3k7Jv2k1pQ" });
        });
        it("should throw an error if the url is not a facebook url", () => {
            const url = "https://www.facebook.com/egkG6ynXs-0";
            expect(() => extractMediaMetaFromUrl(url)).toThrowError();
        });
        it("should retuern the id from facebook.com/.../videos/id url", () => {
            const url =
                "https://www.facebook.com/100005024688471/videos/660233395853696/";
            const result = extractMediaMetaFromUrl(url);
            expect(result).toEqual({ type: "facebook", id: "660233395853696" });
        });
        it("should retuern the id from facebook reel video", () => {
            const url = "https://web.facebook.com/reel/1605252116698374";
            const result = extractMediaMetaFromUrl(url);
            expect(result).toEqual({
                type: "facebook",
                id: "1605252116698374",
            });
        });
    });
    describe("youtube", () => {
        it("should return the id from a youtu.be url", () => {
            const url = "https://youtu.be/UARWKNpeDBI?feature=shared";
            const result = extractMediaMetaFromUrl(url);
            expect(result).toEqual({ type: "youtube", id: "UARWKNpeDBI" });
        });
        it("should return the id from a youtube.com url", () => {
            const url = "https://www.youtube.com/watch?v=J54eUQ0xuhk";
            const result = extractMediaMetaFromUrl(url);
            expect(result).toEqual({ type: "youtube", id: "J54eUQ0xuhk" });
        });
    });
    describe("rumble", () => {
        it("should return the id from a rumble url", () => {
            const url =
                "https://rumble.com/v4nadqz-big-conservative-media-spirals-tittle-tattle.html";
            const result = extractMediaMetaFromUrl(url);
            expect(result).toEqual({ type: "rumble", id: "v4nadqz" });
        });
    });
});
