export const QUEUE_ROOM_TYPE_LABELS: Record<string, string> = {
    LABORATORY: 'Xét nghiệm',
    RADIOLOGY: 'Chẩn đoán hình ảnh',
    RECEPTION: 'Phòng tiếp đón',
    PHARMACY: 'Nhà thuốc',
    CLINIC: 'Phòng khám',
    WAITING: 'Phòng chờ',
    CASHIER: 'Thu ngân',
    OTHER: 'Khác',
    // Thêm các loại khác nếu cần
  }
  
  export function getQueueRoomTypeLabel(type: string): string {
    return QUEUE_ROOM_TYPE_LABELS[type] || type
  }