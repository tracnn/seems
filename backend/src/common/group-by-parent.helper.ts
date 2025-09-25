/**
 * Gom mảng phẳng thành cấu trúc cha – con dạng JSON.
 *
 * @param rows Mảng phẳng từ SQL hoặc bất kỳ nguồn nào.
 * @param parentKeyField Trường dùng để group cha (VD: 'id').
 * @param childFieldName Tên field sẽ chứa mảng con (VD: 'medicines').
 * @param parentFields Các trường thuộc cha.
 * @param childFields Các trường thuộc con.
 * @returns Mảng JSON cha – con.
 */
export function groupByParentHelper<T = any>(
    rows: T[],
    parentKeyField: keyof T,
    childFieldName: string,
    parentFields: (keyof T)[],
    childFields: (keyof T)[]
  ): any[] {
    const map = new Map<any, any>();
  
    for (const row of rows) {
      const parentKey = row[parentKeyField];
  
      if (!map.has(parentKey)) {
        const parentObj: any = {};
  
        for (const field of parentFields) {
          parentObj[field] = row[field];
        }
  
        parentObj[childFieldName] = [];
        map.set(parentKey, parentObj);
      }
  
      const childObj: any = {};
      for (const field of childFields) {
        childObj[field] = row[field];
      }
  
      map.get(parentKey)[childFieldName].push(childObj);
    }
  
    return Array.from(map.values());
  }