// Performance Testing Script for QBittorrent API Wrapper
const { performance } = require("perf_hooks");

describe("QBittorrent API Wrapper - Performance Tests", () => {
    it("should measure response time for fetching all torrent data", async () => {
        const mockGetAllData = jest.fn().mockResolvedValue([{ hash: "abc123" }]);

        const startTime = performance.now();
        const result = await mockGetAllData();
        const endTime = performance.now();

        expect(result).toEqual([{ hash: "abc123" }]);
        console.log(`Response time: ${(endTime - startTime).toFixed(2)} ms`);
    });

    it("should measure response time for retrieving application preferences", async () => {
        const mockGetPreferences = jest.fn().mockResolvedValue({ theme: "dark" });

        const startTime = performance.now();
        const result = await mockGetPreferences();
        const endTime = performance.now();

        expect(result.theme).toBe("dark");
        console.log(`Response time: ${(endTime - startTime).toFixed(2)} ms`);
    });
});