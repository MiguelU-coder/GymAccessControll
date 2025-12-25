import NotificationCenter from './NotificationCenter';

function Header({ title }) {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        <p className="header-date">{currentDate}</p>
      </div>
      <div className="header-right">
        <NotificationCenter />
      </div>
    </header>
  );
}

export default Header;