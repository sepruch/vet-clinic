import { Link } from 'react-router-dom';
import './head.css';
import logo from '../assets/logo.svg';

function Header() {
    return (
        <header className="header">
            <div className="container">
                <Link to="/">
                    <img src={logo} alt="Логотип" className={'logo'} />
                </Link>
            </div>
        </header>
    )
}

export default Header;