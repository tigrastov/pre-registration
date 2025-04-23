import './Home.css';
import { Link } from 'react-router-dom'; 

export default function Home() {
  return (
    <main className="main-container">
      <div className="content-wrapper">
        <div className="text-content">
          <h1 className="main-title">Медицинский массаж</h1>
          <p className="main-description">
            Профессиональный медицинский массаж помогает при:
          </p>
          <ul className="benefits-list">
            <li>Остеохондрозе и болях в спине</li>
            <li>Нарушениях осанки</li>
            <li>Реабилитации после травм</li>
            <li>Головных болях и мигренях</li>
            <li>Синдроме хронической усталости</li>
          </ul>
          <Link to="/booking" className="main-subtitle-link">
            <p className="main-subtitle">
              Запишитесь к нашему специалисту Онлайн
            </p>
          </Link>
        </div>
        
        <div className="contacts-box">
          <h3>Наши контакты:</h3>
          <a href="tel:+79991234567" className="contact-link">+7 (999) 123-45-67</a>
          <a href="https://t.me/massage_clinic" target="_blank" rel="noopener noreferrer" className="contact-link">
            Telegram: @massage_clinic
          </a>
        </div>
      </div>
    </main>
  );
}