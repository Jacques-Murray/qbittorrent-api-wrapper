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

    async getAPIVersion(): Promise<string> {
        return this.request('GET', 'app/version');
    }

    async getAllData(): Promise<{ torrents: TorrentInfo[] }> {
        return this.request('GET', 'torrents/info');
    }

    async addTorrent(params: TorrentAddParameters): Promise<boolean> {
        const formData = new FormData();

        if (params.urls) {
            const urls = Array.isArray(params.urls) ? params.urls.join('\n') : params.urls;
            formData.append('urls', urls);
        }

        if (params.torrents) {
            const torrents = Array.isArray(params.torrents) ? params.torrents : [params.torrents];
            torrents.forEach((torrent, index) => {
                formData.append('torrents', torrent.buffer, torrent.filename || `torrent_${index}.torrent`);
            });
        }

        if (params.savepath) formData.append('savepath', params.savepath);
        if (params.category) formData.append('category', params.category);
        if (params.paused) formData.append('paused', params.paused.toString());
        if (params.skip_checking) formData.append('skip_checking', params.skip_checking.toString());
        if (params.rename) formData.append('rename', params.rename);
        if (params.upLimit) formData.append('upLimit', params.upLimit.toString());
        if (params.dlLimit) formData.append('dlLimit', params.dlLimit.toString());

        return this.request('POST', 'torrents/add', formData);
    }

    async pauseTorrent(hash: string): Promise<boolean> {
        return this.request('POST', 'torrents/pause', { hashes: hash });
    }

    async resumeTorrent(hash: string): Promise<boolean> {
        return this.request('POST', 'torrents/resume', { hashes: hash });
    }

    async removeTorrent(hash: string, deleteData: boolean = false): Promise<boolean> {
        return this.request('POST', 'torrents/delete', { hashes: hash, deleteFiles: deleteData.toString() });
    }
}