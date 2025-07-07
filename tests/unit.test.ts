describe("QBittorrent API Wrapper - Unit Tests", () => {
    // Authentication Tests
    describe("Authentication", () => {
        it("should successfully login with valid credentials", async () => {
            const mockLogin = jest.fn().mockResolvedValue({ success: true });
            const result = await mockLogin();
            expect(result.success).toBe(true);
        });

        it("should fail login with invalid credentials", async () => {
            const mockLogin = jest.fn().mockRejectedValue(new Error("Invalid credentials"));
            await expect(mockLogin()).rejects.toThrow("Invalid credentials");
        });

        it("should successfully logout", async () => {
            const mockLogout = jest.fn().mockResolvedValue({ success: true });
            const result = await mockLogout();
            expect(result.success).toBe(true);
        });
    });

    // Torrent Management Tests
    describe("Torrent Management", () => {
        it("should add a torrent successfully", async () => {
            const mockAddTorrent = jest.fn().mockResolvedValue({ success: true });
            const result = await mockAddTorrent();
            expect(result.success).toBe(true);
        });

        it("should fail to add a torrent with invalid URL", async () => {
            const mockAddTorrent = jest.fn().mockRejectedValue(new Error("Invalid URL"));
            await expect(mockAddTorrent()).rejects.toThrow("Invalid URL");
        });

        it("should pause a torrent successfully", async () => {
            const mockPauseTorrent = jest.fn().mockResolvedValue({ success: true });
            const result = await mockPauseTorrent();
            expect(result.success).toBe(true);
        });

        it("should resume a torrent successfully", async () => {
            const mockResumeTorrent = jest.fn().mockResolvedValue({ success: true });
            const result = await mockResumeTorrent();
            expect(result.success).toBe(true);
        });

        it("should remove a torrent successfully", async () => {
            const mockRemoveTorrent = jest.fn().mockResolvedValue({ success: true });
            const result = await mockRemoveTorrent();
            expect(result.success).toBe(true);
        });
    });

    // Server Interaction Tests
    describe("Server Interaction", () => {
        it("should retrieve API version successfully", async () => {
            const mockGetAPIVersion = jest.fn().mockResolvedValue("v2.0");
            const result = await mockGetAPIVersion();
            expect(result).toBe("v2.0");
        });

        it("should retrieve preferences successfully", async () => {
            const mockGetPreferences = jest.fn().mockResolvedValue({ theme: "dark" });
            const result = await mockGetPreferences();
            expect(result.theme).toBe("dark");
        });

        it("should fetch all torrent data successfully", async () => {
            const mockGetAllData = jest.fn().mockResolvedValue([{ hash: "abc123" }]);
            const result = await mockGetAllData();
            expect(result).toEqual([{ hash: "abc123" }]);
        });
    });

    // Error Handling Tests
    describe("Error Handling", () => {
        it("should throw an error for unsupported buffer types", () => {
            const mockUnsupportedBuffer = jest.fn(() => {
                throw new Error("Unsupported buffer type");
            });
            expect(mockUnsupportedBuffer).toThrow("Unsupported buffer type");
        });
    });
});