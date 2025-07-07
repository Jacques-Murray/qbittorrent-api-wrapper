/**
 * QBittorrent API Wrapper
 * Provides an interface to interact with the QBittorrent API.
 */

import { ofetch } from 'ofetch';
import { Buffer } from 'buffer';

/**
 * Configuration options for QBittorrentClient.
 */
interface QBittorrentConfig {
    baseUrl: string; // Base URL of the QBittorrent server
    username?: string; // Optional username for authentication
    password?: string; // Optional password for authentication
}

/**
 * Represents a torrent file to be added.
 */
interface TorrentFile {
    filename?: string; // Optional filename for the torrent
    name?: string; // Optional name for the torrent
    buffer: Buffer | string; // Torrent file content
    content_type: string; // MIME type of the torrent file
}

/**
 * Parameters for adding a torrent.
 */
interface TorrentAddParameters {
    urls?: string | string[]; // URLs of torrents to add
    torrents?: TorrentFile | TorrentFile[]; // Torrent files to add
    savepath?: string; // Path to save the torrent
    category?: string; // Category for the torrent
    paused?: boolean; // Whether to add the torrent in a paused state
    skip_checking?: boolean; // Whether to skip hash checking
    rename?: string; // Rename the torrent
    upLimit?: number; // Upload speed limit
    dlLimit?: number; // Download speed limit
}

/**
 * Parameters for retrieving torrent information.
 */
interface TorrentInfoParameters {
    filter?: 'all' | 'downloading' | 'seeding' | 'completed' | 'paused' | 'active' | 'inactive'; // Filter torrents by state
    category?: string; // Filter torrents by category
    sort?: string; // Sort torrents by a specific field
    reverse?: boolean; // Reverse the sorting order
    limit?: number; // Limit the number of torrents returned
    offset?: number; // Offset for pagination
    hashes?: string | string[]; // Filter torrents by hash
}

/**
 * Represents information about a torrent.
 */
interface TorrentInfo {
    hash: string; // Unique hash of the torrent
    name: string; // Name of the torrent
    size: number; // Size of the torrent
    progress: number; // Download progress (0-1)
    state: string; // Current state of the torrent
}

/**
 * QBittorrentClient
 * Provides methods to interact with the QBittorrent API.
 */
class QBittorrentClient {
    private baseUrl: string; // Base URL of the QBittorrent server
    private username?: string; // Username for authentication
    private password?: string; // Password for authentication
    private sid?: string; // Session ID for authentication

    /**
     * Initializes the QBittorrentClient with the given configuration.
     * @param config Configuration options for the client.
     */
    constructor(config: QBittorrentConfig) {
        this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Ensure baseUrl does not end with a slash
        this.username = config.username;
        this.password = config.password;
    }

    /**
     * Makes a request to the QBittorrent API.
     * Handles authentication and session management.
     * @param method HTTP method (GET, POST, etc.).
     * @param endpoint API endpoint to call.
     * @param data Optional data to send with the request.
     * @returns The response from the API.
     */
    private async request(method: string, endpoint: string, data?: any): Promise<any> {
        const url = `${this.baseUrl}/api/v2/${endpoint}`;

        // Authenticate if not logged in
        if (!this.sid && this.username && this.password) {
            await this.login();
        }

        const headers: Record<string, string> = {};
        if (this.sid) {
            headers['Cookie'] = `SID=${this.sid}`; // Include session ID in headers
        }

        try {
            return await ofetch(url, {
                method,
                headers,
                body: data,
                parseResponse: (txt: string) => txt === 'Ok.' ? true : JSON.parse(txt), // Parse response based on content
            });
        } catch (error) {
            throw new Error(`Request failed: ${error}`);
        }
    }

    /**
     * Logs in to the QBittorrent server.
     * Sets the session ID (SID) for subsequent requests.
     * @throws Error if login fails or SID extraction fails.
     */
    async login(): Promise<void> {
        const response = await ofetch(`${this.baseUrl}/api/v2/auth/login`, {
            method: 'POST',
            body: new URLSearchParams({
                username: this.username || '',
                password: this.password || ''
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response === 'Fails.') {
            throw new Error('Login failed');
        }

        // Extract SID from response headers
        this.sid = response.headers?.get('set-cookie')?.match(/SID=([^;]+)/)?.[1];
        if (!this.sid) {
            console.error("SID extraction failed. Response headers:", response.headers);
            throw new Error("Failed to extract session ID (SID).");
        }
    }

    /**
     * Logs out from the QBittorrent server.
     * Clears the session ID.
     */
    async logout(): Promise<void> {
        await this.request('POST', 'auth/logout');
        this.sid = undefined;
    }

    /**
     * Retrieves the API version of the QBittorrent server.
     * @returns The API version as a string.
     */
    async getAPIVersion(): Promise<string> {
        return this.request('GET', 'app/version');
    }

    /**
     * Retrieves all torrent data from the server.
     * @returns An object containing an array of torrent information.
     */
    async getAllData(): Promise<{ torrents: TorrentInfo[] }> {
        return this.request('GET', 'torrents/info');
    }

    /**
     * Adds a torrent to the QBittorrent server.
     * @param params Parameters for adding the torrent.
     * @returns True if the torrent was added successfully.
     * @throws Error if no torrent or URL is provided.
     */
    async addTorrent(params: TorrentAddParameters): Promise<boolean> {
        if (!params.torrents || (Array.isArray(params.torrents) && params.torrents.length === 0)) {
            throw new Error("At least one torrent or URL must be provided.");
        }
        const formData = new FormData();

        // Add URLs to the form data
        if (params.urls) {
            const urls = Array.isArray(params.urls) ? params.urls.join('\n') : params.urls;
            formData.append('urls', urls);
        }

        // Add torrent files to the form data
        if (params.torrents) {
            const torrents = Array.isArray(params.torrents) ? params.torrents : [params.torrents];
            torrents.forEach((torrent, index) => {
                let buffer: BlobPart;

                if (typeof torrent.buffer === 'string') {
                    buffer = torrent.buffer;
                } else if (Buffer.isBuffer(torrent.buffer)) {
                    buffer = Uint8Array.from(torrent.buffer).buffer;
                } else if (isArrayBuffer(torrent.buffer)) {
                    buffer = torrent.buffer;
                } else if (isSharedArrayBuffer(torrent.buffer)) {
                    buffer = new Blob([new Uint8Array(torrent.buffer)], { type: torrent.content_type });
                } else {
                    throw new Error('Unsupported buffer type');
                }

                const blob = new Blob([buffer], { type: torrent.content_type });
                formData.append('torrents', blob, torrent.filename || `torrent_${index}.torrent`);
            });
        }

        // Add other parameters to the form data
        if (params.savepath) formData.append('savepath', params.savepath);
        if (params.category) formData.append('category', params.category);
        if (params.paused) formData.append('paused', params.paused.toString());
        if (params.skip_checking) formData.append('skip_checking', params.skip_checking.toString());
        if (params.rename) formData.append('rename', params.rename);
        if (params.upLimit) formData.append('upLimit', params.upLimit.toString());
        if (params.dlLimit) formData.append('dlLimit', params.dlLimit.toString());

        return this.request('POST', 'torrents/add', formData);
    }

    /**
     * Pauses a torrent by its hash.
     * @param hash The hash of the torrent to pause.
     * @returns True if the torrent was paused successfully.
     */
    async pauseTorrent(hash: string): Promise<boolean> {
        return this.request('POST', 'torrents/pause', { hashes: hash });
    }

    /**
     * Resumes a paused torrent by its hash.
     * @param hash The hash of the torrent to resume.
     * @returns True if the torrent was resumed successfully.
     */
    async resumeTorrent(hash: string): Promise<boolean> {
        return this.request('POST', 'torrents/resume', { hashes: hash });
    }

    /**
     * Removes a torrent by its hash.
     * Optionally deletes the associated data.
     * @param hash The hash of the torrent to remove.
     * @param deleteData Whether to delete the torrent's data.
     * @returns True if the torrent was removed successfully.
     */
    async removeTorrent(hash: string, deleteData: boolean = false): Promise<boolean> {
        return this.request('POST', 'torrents/delete', { hashes: hash, deleteFiles: deleteData.toString() });
    }

    /**
     * Retrieves information about torrents based on the given parameters.
     * @param params Parameters for filtering and sorting torrents.
     * @returns An array of torrent information.
     */
    async getTorrentInfo(params: TorrentInfoParameters = {}): Promise<TorrentInfo[]> {
        const query = new URLSearchParams();
        if (params.filter) query.append('filter', params.filter);
        if (params.category) query.append('category', params.category);
        if (params.sort) query.append('sort', params.sort);
        if (params.reverse) query.append('reverse', params.reverse.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.offset) query.append('offset', params.offset.toString());
        if (params.hashes) {
            const hashes = Array.isArray(params.hashes) ? params.hashes.join('|') : params.hashes;
            query.append('hashes', hashes);
        }

        return this.request('GET', `torrents/info?${query.toString()}`);
    }

    /**
     * Sets the category for a torrent.
     * @param torrentHash The hash of the torrent.
     * @param category The category to set.
     * @throws Error if setting the category fails.
     */
    async setCategory(torrentHash: string, category: string): Promise<void> {
        const response = await this.request('POST', 'torrents/setCategory', {
            hashes: torrentHash,
            category: category,
        });
        if (response !== true) {
            throw new Error('Failed to set category');
        }
    }

    /**
     * Retrieves peers for a specific torrent.
     * @param torrentHash The hash of the torrent.
     * @returns The peers of the torrent.
     * @throws Error if retrieving peers fails.
     */
    async getTorrentPeers(torrentHash: string): Promise<any> {
        const response = await this.request('GET', `torrents/peers?hash=${torrentHash}`);
        if (!response) {
            throw new Error('Failed to retrieve torrent peers');
        }
        return response;
    }

    /**
     * Retrieves application preferences from the QBittorrent server.
     * @returns The preferences of the application.
     * @throws Error if retrieving preferences fails.
     */
    async getPreferences(): Promise<any> {
        const response = await this.request('GET', 'app/preferences');
        if (!response) {
            throw new Error('Failed to retrieve preferences');
        }
        return response;
    }
}

export { QBittorrentClient, TorrentAddParameters, TorrentInfoParameters, TorrentInfo, TorrentFile };

/**
 * Type guard function to check if a value is an ArrayBuffer.
 * @param buffer The value to check.
 * @returns True if the value is an ArrayBuffer.
 */
function isArrayBuffer(buffer: unknown): buffer is ArrayBuffer {
    return buffer instanceof ArrayBuffer;
}

/**
 * Type guard function to check if a value is a SharedArrayBuffer.
 * @param buffer The value to check.
 * @returns True if the value is a SharedArrayBuffer.
 */
function isSharedArrayBuffer(buffer: unknown): buffer is SharedArrayBuffer {
    return buffer instanceof SharedArrayBuffer;
}