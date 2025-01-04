interface Settings {
    maxSentences: number;
    maxWords: number;
}

const DEFAULT_SETTINGS: Settings = {
    maxSentences: 10,
    maxWords: 50
};

const SETTINGS_KEY = 'ei_settings';

export const settingsService = {
    // 获取设置
    getSettings(): Settings {
        try {
            const settings = localStorage.getItem(SETTINGS_KEY);
            return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
        } catch (error) {
            console.error('Failed to get settings:', error);
            return DEFAULT_SETTINGS;
        }
    },

    // 保存设置
    saveSettings(settings: Partial<Settings>): Settings {
        try {
            const currentSettings = this.getSettings();
            const newSettings = {
                ...currentSettings,
                ...settings
            };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            return newSettings;
        } catch (error) {
            console.error('Failed to save settings:', error);
            throw error;
        }
    }
};
