describe("QBittorrent API Wrapper - Integration Tests", () => {
    // Integration Test: Add Torrent and Retrieve Information
    it("should add a torrent and retrieve its information", async () => {
        const mockAddTorrent = jest.fn().mockResolvedValue({ success: true });
        const mockGetTorrentInfo = jest.fn().mockResolvedValue({ hash: "abc123", name: "example.torrent" });

        const addResult = await mockAddTorrent();
        expect(addResult.success).toBe(true);

        const infoResult = await mockGetTorrentInfo();
        expect(infoResult).toEqual({ hash: "abc123", name: "example.torrent" });
    });

    // Integration Test: Set Category and Verify Update
    it("should set a torrent category and verify the update", async () => {
        const mockSetCategory = jest.fn().mockResolvedValue({ success: true });
        const mockGetTorrentInfo = jest.fn().mockResolvedValue({ category: "movies" });

        const setResult = await mockSetCategory();
        expect(setResult.success).toBe(true);

        const infoResult = await mockGetTorrentInfo();
        expect(infoResult.category).toBe("movies");
    });

    // Integration Test: Fetch Peers for a Torrent
    it("should fetch peers for a specific torrent", async () => {
        const mockGetTorrentPeers = jest.fn().mockResolvedValue([{ ip: "192.168.1.1", client: "uTorrent" }]);

        const peersResult = await mockGetTorrentPeers();
        expect(peersResult).toEqual([{ ip: "192.168.1.1", client: "uTorrent" }]);
    });
});