import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/api/services'
import type { 
  Product, 
  UpdateProductRequest,
  QueryParams
} from '@/api/types'

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
  featured: (limit: number) => [...productKeys.all, 'featured', limit] as const,
  latest: (limit: number) => [...productKeys.all, 'latest', limit] as const,
  byCategory: (category: string, params: QueryParams) => 
    [...productKeys.all, 'category', category, params] as const,
  search: (query: string, params: QueryParams) => 
    [...productKeys.all, 'search', query, params] as const,
  stats: () => [...productKeys.all, 'stats'] as const,
}

/**
 * Hook để lấy danh sách sản phẩm với phân trang
 */
export function useProducts(params?: QueryParams) {
  return useQuery({
    queryKey: productKeys.list(params || {}),
    queryFn: () => productService.getProducts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook để lấy thông tin sản phẩm theo ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook để lấy danh sách danh mục
 */
export function useProductCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: productService.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook để lấy sản phẩm nổi bật
 */
export function useFeaturedProducts(limit: number = 10) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => productService.getFeaturedProducts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook để lấy sản phẩm mới nhất
 */
export function useLatestProducts(limit: number = 10) {
  return useQuery({
    queryKey: productKeys.latest(limit),
    queryFn: () => productService.getLatestProducts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook để lấy sản phẩm theo danh mục
 */
export function useProductsByCategory(category: string, params?: QueryParams) {
  return useQuery({
    queryKey: productKeys.byCategory(category, params || {}),
    queryFn: () => productService.getProductsByCategory(category, params),
    enabled: !!category,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook để tìm kiếm sản phẩm
 */
export function useSearchProducts(query: string, params?: QueryParams) {
  return useQuery({
    queryKey: productKeys.search(query, params || {}),
    queryFn: () => productService.searchProducts(query, params),
    enabled: !!query && query.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook để lấy thống kê sản phẩm
 */
export function useProductStats() {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: productService.getProductStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook để tạo sản phẩm mới
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: (newProduct) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      
      // Add new product to cache
      queryClient.setQueryData(productKeys.detail(newProduct.id), newProduct)
      
      // Invalidate categories
      queryClient.invalidateQueries({ queryKey: productKeys.categories() })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}

/**
 * Hook để cập nhật sản phẩm
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productService.updateProduct(id, data),
    onSuccess: (updatedProduct, { id }) => {
      // Update product in cache
      queryClient.setQueryData(productKeys.detail(id), updatedProduct)
      
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      
      // Invalidate categories if category changed
      queryClient.invalidateQueries({ queryKey: productKeys.categories() })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}

/**
 * Hook để xóa sản phẩm
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: (_, productId) => {
      // Remove product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) })
      
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}

/**
 * Hook để khôi phục sản phẩm đã xóa
 */
export function useRestoreProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productService.restoreProduct,
    onSuccess: (restoredProduct) => {
      // Add restored product to cache
      queryClient.setQueryData(productKeys.detail(restoredProduct.id), restoredProduct)
      
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}

/**
 * Hook để cập nhật hình ảnh sản phẩm
 */
export function useUpdateProductImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      productService.updateProductImage(id, file),
    onSuccess: (result, { id }) => {
      // Update product with new image URL
      queryClient.setQueryData(productKeys.detail(id), (oldData: Product | undefined) => {
        if (oldData) {
          return { ...oldData, image: result.imageUrl }
        }
        return oldData
      })
    },
  })
}

/**
 * Hook để xóa hình ảnh sản phẩm
 */
export function useDeleteProductImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productService.deleteProductImage,
    onSuccess: (_, productId) => {
      // Update product to remove image
      queryClient.setQueryData(productKeys.detail(productId), (oldData: Product | undefined) => {
        if (oldData) {
          return { ...oldData, image: undefined }
        }
        return oldData
      })
    },
  })
}

/**
 * Hook để kích hoạt/tắt sản phẩm
 */
export function useToggleProductStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productService.toggleProductStatus,
    onSuccess: (updatedProduct) => {
      // Update product in cache
      queryClient.setQueryData(productKeys.detail(updatedProduct.id), updatedProduct)
      
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}

/**
 * Hook để cập nhật số lượng tồn kho
 */
export function useUpdateProductStock() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      productService.updateStock(id, quantity),
    onSuccess: (updatedProduct) => {
      // Update product in cache
      queryClient.setQueryData(productKeys.detail(updatedProduct.id), updatedProduct)
      
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}

/**
 * Hook để xuất danh sách sản phẩm
 */
export function useExportProducts() {
  return useMutation({
    mutationFn: productService.exportProducts,
  })
}

/**
 * Hook để import sản phẩm từ file
 */
export function useImportProducts() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productService.importProducts,
    onSuccess: () => {
      // Invalidate products list after import
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.categories() })
      queryClient.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}
