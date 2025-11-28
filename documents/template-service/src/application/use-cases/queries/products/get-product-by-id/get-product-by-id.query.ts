/**
 * Get Product By ID Query
 * CQRS Query for getting a single product by ID
 */
export class GetProductByIdQuery {
  constructor(public readonly productId: string) {}
}

