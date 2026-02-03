import Header from '../components/Header.jsx';
import "./HomePage.css";
import Footer from '../components/Footer.jsx';
import dog from '../assets/dog.svg';
import food from '../assets/food.svg';

function HomePage() {
    return (
        <div className="page-wrapper">
            <Header />

            <main className="content">
                <div className="text-container">
                    <h1 className="main-title">
                        Больше, чем просто лечение <br/>
                    </h1>
                    <p className="description">
                        В нашей клинике мы понимаем: питомец - это член семьи. Уже более 5 лет мы помогаем владельцам сохранять здоровье и активность их любимцев.
                        Мы объединили профессиональное оборудование экспертного класса и команду высококлассных специалистов, для которых ветеринария - это призвание.
                    </p>
                    <a className="call-button" href={"tel:88005553535"}>
                        Позвонить нам
                    </a>
                </div>
                <img src={food} alt="миска" className="food" />
                <img src={dog} alt="Собака" className="dog-bg" />
            </main>

            <Footer />
        </div>
    );
}

export default HomePage;
