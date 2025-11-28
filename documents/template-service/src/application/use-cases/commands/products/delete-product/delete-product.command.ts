/**
 * Delete Product Command
 * CQRS Command for soft deleting a product
 */
export class DeleteProductCommand {
  constructor(
    public readonly productId: string,
    public readonly deletedBy: string,
  ) {}
}

