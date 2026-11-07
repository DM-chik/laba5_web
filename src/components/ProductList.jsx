import { useEffect, useMemo, useState } from "react";
import { Filters } from "./Filters";
import { ProductCard } from "./ProductCard";
import { FALLBACK_PRODUCTS } from "../data/fallbackProducts";
import { getCategoryLabel } from "../constants";
import "./ProductList.css";

const API_URL = "https://fakestoreapi.com/products";

export function ProductList() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingFallback, setUsingFallback] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const [filters, setFilters] = useState({
        categories: [],
        minPrice: null,
        maxPrice: null,
    });

    // --- 1. Загрузка данных при монтировании ---
    useEffect(() => {
        const controller = new AbortController();

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                setUsingFallback(false);

                const res = await fetch(API_URL, { signal: controller.signal });

                if (!res.ok) {
                    throw new Error(`Ошибка сети: ${res.status}`);
                }

                const data = await res.json();
                setProducts(data);
            } catch (err) {
                // Отменённый запрос — это не ошибка
                if (err.name === "AbortError") return;

                // API недоступен — показываем резервный набор,
                // чтобы лабораторную можно было проверить без сети
                setProducts(FALLBACK_PRODUCTS);
                setUsingFallback(true);
                setError(err.message);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        // Отмена запроса при размонтировании
        return () => controller.abort();
    }, [reloadKey]);

    // --- 2. Фильтрация на клиенте ---
    useEffect(() => {
        let result = products;

        if (filters.categories.length > 0) {
            result = result.filter((product) =>
                filters.categories.includes(product.category),
            );
        }

        if (filters.minPrice !== null) {
            result = result.filter((product) => product.price >= filters.minPrice);
        }

        if (filters.maxPrice !== null) {
            result = result.filter((product) => product.price <= filters.maxPrice);
        }

        setFilteredProducts(result);
    }, [products, filters]);

    // --- Категории с количеством товаров ---
    const categoryOptions = useMemo(() => {
        const counts = new Map();

        products.forEach((product) => {
            counts.set(product.category, (counts.get(product.category) || 0) + 1);
        });

        return [...counts.entries()].map(([value, count]) => ({
            value,
            label: getCategoryLabel(value),
            count,
        }));
    }, [products]);

    // --- Диапазон цен ---
    const bounds = useMemo(() => {
        if (products.length === 0) return { min: 0, max: 0 };

        const prices = products.map((product) => product.price);
        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices)),
        };
    }, [products]);

    const handleApply = (nextFilters) => {
        setFilters(nextFilters);
    };

    const handleReset = () => {
        setFilters({
            categories: [],
            minPrice: bounds.min,
            maxPrice: bounds.max,
        });
    };

    // --- Состояние загрузки ---
    if (loading) {
        return (
            <section className="catalog" aria-busy="true">
                <p className="catalog__status">Загрузка товаров…</p>
                <div className="product-grid">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div className="skeleton-card" key={index}>
                            <div className="skeleton-card__image" />
                            <div className="skeleton-card__line" />
                            <div className="skeleton-card__line skeleton-card__line--short" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // --- Ошибка без резервных данных ---
    if (error && !usingFallback) {
        return (
            <section className="catalog">
                <div className="catalog__message catalog__message--error">
                    <h2>Не удалось загрузить товары</h2>
                    <p>{error}</p>
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => setReloadKey((key) => key + 1)}
                    >
                        Повторить запрос
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="catalog">
            {usingFallback && (
                <div className="catalog__notice" role="status">
                    Публичный API недоступен ({error}). Показан резервный набор
                    товаров — фильтры работают так же.
                </div>
            )}

            <div className="catalog__layout">
                <Filters
                    categories={categoryOptions}
                    bounds={bounds}
                    initialFilters={{
                        categories: filters.categories,
                        minPrice: filters.minPrice ?? bounds.min,
                        maxPrice: filters.maxPrice ?? bounds.max,
                    }}
                    onApply={handleApply}
                    onReset={handleReset}
                />

                <div className="catalog__content">
                    <div className="catalog__toolbar">
                        <p className="catalog__count">
                            Найдено: <strong>{filteredProducts.length}</strong> из{" "}
                            {products.length}
                        </p>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="catalog__message">
                            <h2>Товары не найдены</h2>
                            <p>Попробуйте изменить категории или диапазон цен.</p>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
