import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo">
        Массажный салон
      </Link>
      <nav>
        <Link to="/" className="nav-link">Главная</Link>
        <Link to="/booking" className="nav-link">Запись</Link>
      </nav>
    </header>
  );
}

export default Header;