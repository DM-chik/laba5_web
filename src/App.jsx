import { ProductList } from "./components/ProductList";
import "./App.css";

function App() {
    return (
        <div className="app">
            <header className="app__header">
                <h1 className="app__title">Каталог товаров</h1>
                <p className="app__subtitle">
                    Данные загружаются с fakestoreapi.com, фильтрация выполняется
                    на клиенте.
                </p>
            </header>
            <main>
                <ProductList />
            </main>
        </div>
    );
}

export default App;
