import { NavLink } from 'react-router-dom';
import './Footer.css';
import addPatient from '../assets/addPatient.svg';
import cards from '../assets/cards.svg';
import doctor from '../assets/doctor.svg';

function Footer() {
    return (
        <footer className="footer-nav">
            <NavLink to="/medcards" className="nav-item">
                <img src={cards} alt="Карточки" className={'icons'} />
                <span>Мед. карты</span>
            </NavLink>

            <NavLink to="/add" className="nav-item">
                <img src={addPatient} alt="Добавить пациента" className={'icons'} />
                <span>Записаться</span>
            </NavLink>

            <NavLink to="/appointment" className="nav-item">
                <img src={doctor} alt="Врачи" className={'icons'} />
                <span>Врачи</span>
            </NavLink>


        </footer>
    );
}

export default Footer;