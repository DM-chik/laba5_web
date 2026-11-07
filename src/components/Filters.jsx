import { useState } from "react";
import "./Filters.css";

/**
 * Панель фильтров.
 * Локальное состояние хранит «черновик» фильтров, а родителю значения
 * уходят только по кнопке «Применить» — после валидации.
 */
export function Filters({ categories, bounds, initialFilters, onApply, onReset }) {
    const [selected, setSelected] = useState(initialFilters.categories);
    const [minPrice, setMinPrice] = useState(String(initialFilters.minPrice));
    const [maxPrice, setMaxPrice] = useState(String(initialFilters.maxPrice));
    const [errors, setErrors] = useState({});

    const rangeMax = Math.max(bounds.max, bounds.min + 1);

    const toggleCategory = (value) => {
        setSelected((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value],
        );
    };

    const validate = () => {
        const nextErrors = {};
        const min = Number(minPrice);
        const max = Number(maxPrice);

        if (minPrice.trim() === "" || Number.isNaN(min)) {
            nextErrors.min = "Укажите минимальную цену";
        } else if (min < 0) {
            nextErrors.min = "Цена не может быть отрицательной";
        }

        if (maxPrice.trim() === "" || Number.isNaN(max)) {
            nextErrors.max = "Укажите максимальную цену";
        } else if (max < 0) {
            nextErrors.max = "Цена не может быть отрицательной";
        }

        if (
            !nextErrors.min &&
            !nextErrors.max &&
            min > max
        ) {
            nextErrors.min = "Цена «от» не может быть больше цены «до»";
            nextErrors.max = "Цена «до» не может быть меньше цены «от»";
        }

        return nextErrors;
    };

    const handleApply = () => {
        const nextErrors = validate();
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) return;

        onApply({
            categories: selected,
            minPrice: Number(minPrice),
            maxPrice: Number(maxPrice),
        });
    };

    const handleReset = () => {
        setSelected([]);
        setMinPrice(String(bounds.min));
        setMaxPrice(String(bounds.max));
        setErrors({});
        onReset();
    };

    const handleMinChange = (value) => {
        setMinPrice(value);
        setErrors((prev) => ({ ...prev, min: "" }));
    };

    const handleMaxChange = (value) => {
        setMaxPrice(value);
        setErrors((prev) => ({ ...prev, max: "" }));
    };

    return (
        <aside className="filters" aria-label="Фильтры каталога">
            <div className="filters__head">
                <h2 className="filters__title">Фильтры</h2>
                <button type="button" className="filters__reset" onClick={handleReset}>
                    Сбросить
                </button>
            </div>

            <fieldset className="filters__group">
                <legend className="filters__legend">Категории</legend>
                <div className="chips">
                    {categories.map((category) => {
                        const active = selected.includes(category.value);
                        return (
                            <label
                                key={category.value}
                                className={active ? "chip chip--active" : "chip"}
                            >
                                <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={() => toggleCategory(category.value)}
                                />
                                <span>{category.label}</span>
                                <span className="chip__count">{category.count}</span>
                            </label>
                        );
                    })}
                </div>
            </fieldset>

            <fieldset className="filters__group">
                <legend className="filters__legend">Цена, ₽</legend>

                <div className="price-inputs">
                    <label className="price-input">
                        <span>от</span>
                        <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={minPrice}
                            onChange={(e) => handleMinChange(e.target.value)}
                            className={errors.min ? "is-invalid" : ""}
                        />
                    </label>
                    <label className="price-input">
                        <span>до</span>
                        <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={maxPrice}
                            onChange={(e) => handleMaxChange(e.target.value)}
                            className={errors.max ? "is-invalid" : ""}
                        />
                    </label>
                </div>

                {errors.min && <span className="filters__error">{errors.min}</span>}
                {errors.max && <span className="filters__error">{errors.max}</span>}

                <label className="range">
                    <span className="range__label">
                        Минимум: <strong>{minPrice || 0} ₽</strong>
                    </span>
                    <input
                        type="range"
                        min={bounds.min}
                        max={rangeMax}
                        step="1"
                        value={
                            Number.isNaN(Number(minPrice))
                                ? bounds.min
                                : Number(minPrice)
                        }
                        onChange={(e) => handleMinChange(e.target.value)}
                    />
                </label>

                <label className="range">
                    <span className="range__label">
                        Максимум: <strong>{maxPrice || 0} ₽</strong>
                    </span>
                    <input
                        type="range"
                        min={bounds.min}
                        max={rangeMax}
                        step="1"
                        value={
                            Number.isNaN(Number(maxPrice))
                                ? rangeMax
                                : Number(maxPrice)
                        }
                        onChange={(e) => handleMaxChange(e.target.value)}
                    />
                </label>
            </fieldset>

            <button type="button" className="btn btn--primary" onClick={handleApply}>
                Применить фильтры
            </button>
        </aside>
    );
}
