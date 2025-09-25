import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

/**
 * Thêm điều kiện tìm kiếm (search) cho QueryBuilder.
 */
export function applySearch<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  fields: string[],
  keyword?: string
) {
  if (keyword) {
    const orWheres: string[] = [];
    const params: any = {};
    fields.forEach((field, idx) => {
      const param = `search${idx}`;
      orWheres.push(`remove_accents(UPPER(${field})) LIKE remove_accents(:${param})`);
      params[param] = `%${keyword.toUpperCase()}%`;
    });
    // Gộp tất cả các điều kiện OR lại với nhau, sau đó andWhere vào query hiện tại
    if (orWheres.length > 0) {
      qb.andWhere(`(${orWheres.join(' OR ')})`, params);
    }
  }
  return qb;
}

/**
 * Thêm điều kiện sort cho QueryBuilder.
 */
export function applySort<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    sortField?: string,
    sortOrder?: 'ASC' | 'DESC' | 1 | -1 | string,
    defaultField = 'id',
    defaultOrder: 'ASC' | 'DESC' = 'ASC',
    alias = 'title' // thêm alias mặc định
  ) {
    let direction: 'ASC' | 'DESC' = defaultOrder;
    if (sortOrder === -1 || sortOrder === 'DESC' || sortOrder === '-1') direction = 'DESC';
    if (sortOrder === 1 || sortOrder === 'ASC' || sortOrder === '1') direction = 'ASC';
  
    // Luôn thêm alias nếu sortField không có dấu chấm (.)
    const fullSortField = sortField
      ? sortField.includes('.') ? sortField : `${alias}.${sortField}`
      : `${alias}.${defaultField}`;
  
    qb.orderBy(fullSortField, direction);
    return qb;
  }

/**
 * Áp dụng phân trang cho QueryBuilder.
 */
export function applyPagination<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  page = 1,
  limit = 10
) {
  qb.skip((page - 1) * limit).take(limit);
  return qb;
}  