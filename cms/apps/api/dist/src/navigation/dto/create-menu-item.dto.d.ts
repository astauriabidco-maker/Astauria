export declare class CreateMenuItemDto {
    label: string;
    url: string;
    icon?: string;
    order?: number;
    isActive?: boolean;
    location?: 'HEADER' | 'FOOTER';
    parentId?: string;
}
