import { ofetch } from 'ofetch';

interface QBittorrentConfig {
    baseUrl: string;
    username?: string;
    password?: string;
}

interface TorrentFile {
    filename?: string;
    name?: string;
    buffer: Buffer | string;
    content_type: string;
}

interface TorrentAddParameters {
    urls?: string | string[];
    torrents?: TorrentFile | TorrentFile[];
    savepath?: string;
    category?: string;
    paused?: boolean;
    skip_checking?: boolean;
    rename?: string;
    upLimit?: number;
    dlLimit?: number;
}

interface TorrentInfoParameters {
    filter?: 'all' | 'downloading' | 'seeding' | 'completed' | 'paused' | 'active' | 'inactive';
    category?: string;
    sort?: string;
    reverse?: boolean;
    limit?: number;
    offset?: number;
    hashes?: string | string[];
}

interface TorrentInfo {
    hash: string;
    name: string;
    size: number;
    progress: number;
    state: string;
}

class QBittorrentClient {
    private baseUrl: string;
    private username?: string;
    private password?: string;
    private sid?: string;

    constructor(config: QBittorrentConfig) {
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
        this.username = config.username;
        this.password = config.password;
    }

    private async request(method: string, endpoint: string, data?: any): Promise<any> {
        const url = `${this.baseUrl}/api/v2/${endpoint}`;

        // Handle authentication if not logged in
        if (!this.sid && this.username && this.password) {
            await this.login();
        }

        const headers: Record<string, string> = {};
        if (this.sid) {
            headers['Cookie'] = `SID=${this.sid}`;
        }

        try {
            return await ofetch(url, {
                method,
                headers,
                body: data,
                parseResponse: (txt) => txt === 'Ok.' ? true : JSON.parse(txt),
            });
        } catch (error) {
            throw new Error(`Request failed: ${error}`);
        }
    }

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

        // Extract SID from Set-Cookie header (simplified, adjust based on actual response)
        this.sid = response.headers?.get('set-cookie')?.match(/SID=([^;]+)/)?.[1];
        if (!this.sid) {
            throw new Error('Failed to retrieve session ID');
        }
    }

    async logout(): Promise<void> {
        await this.request('POST', 'auth/logout');
        this.sid = undefined;
    }
}