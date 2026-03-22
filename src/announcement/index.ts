/**
 * AG Pro - Announcement stub (公告服务已移除)
 * 保留接口避免其他模块报错，但不执行任何操作
 */

export interface AnnouncementState {
    announcements: any[];
    unreadCount: number;
}

class AnnouncementServiceStub {
    initialize(_context: any): void { /* noop */ }
    async getState(): Promise<AnnouncementState> {
        return { announcements: [], unreadCount: 0 };
    }
    async forceRefresh(): Promise<AnnouncementState> {
        return { announcements: [], unreadCount: 0 };
    }
    async markAsRead(_id: string): Promise<void> { /* noop */ }
    async markAllAsRead(): Promise<void> { /* noop */ }
    async dismiss(_id: string): Promise<void> { /* noop */ }
}

export const announcementService = new AnnouncementServiceStub();
