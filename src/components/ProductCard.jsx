import { useState } from "react";
import { formatPrice, getCategoryLabel } from "../constants";
import "./ProductCard.css";

export function ProductCard({ product }) {
    const [imageFailed, setImageFailed] = useState(false);
    const showImage = product.image && !imageFailed;

    return (
        <article className="product-card">
            <div className="product-card__media">
                {showImage ? (
                    <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <div className="product-card__placeholder" aria-hidden="true">
                        🛍️
                    </div>
                )}
            </div>

            <div className="product-card__body">
                <span className="product-card__category">
                    {getCategoryLabel(product.category)}
                </span>
                <h3 className="product-card__title">{product.title}</h3>

                {product.rating && (
                    <p className="product-card__rating">
                        ★ {product.rating.rate.toFixed(1)}
                        <span className="product-card__reviews">
                            ({product.rating.count} отзывов)
                        </span>
                    </p>
                )}

                <p className="product-card__price">{formatPrice(product.price)}</p>
            </div>
        </article>
    );
}
