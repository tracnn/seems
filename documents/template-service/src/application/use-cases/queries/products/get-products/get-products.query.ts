/**
 * Get Products Query
 * CQRS Query for getting list of products
 */
export class GetProductsQuery {
  constructor(public readonly filters: any) {}
}

