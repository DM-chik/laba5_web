// Человекочитаемые названия категорий fakestoreapi
export const CATEGORY_LABELS = {
    electronics: "Электроника",
    jewelery: "Ювелирные изделия",
    "men's clothing": "Мужская одежда",
    "women's clothing": "Женская одежда",
};

export const getCategoryLabel = (category) =>
    CATEGORY_LABELS[category] || category;

export const formatPrice = (value) =>
    new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
    }).format(value);
