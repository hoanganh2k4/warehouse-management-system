import type { Product } from '../types.ts';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      <h3>{product.name}</h3>
      <p>
        <strong>SKU:</strong> {product.skuCode}
      </p>
      <p>
        <strong>Category:</strong> {product.category.name}
      </p>
      <p>
        <strong>Unit:</strong> {product.unit}
      </p>
      <p>
        <strong>Heavy:</strong> {product.isHeavy ? 'Yes' : 'No'}
      </p>
    </article>
  );
}
