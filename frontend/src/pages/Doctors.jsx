import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Doctors.css';
import house from '../assets/house.jpg';
import bykov from '../assets/bykov.jpg';
import aibolit from '../assets/aibolit.jpg';

const defaultPhoto = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";
const localPhotos = {
    'Хаус Грегори': house,
    'Быков Андрей Евгеньевич': bykov,
    'Айболит': aibolit,
};
function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .order('id', { ascending: true }); // Сортируем по ID (Хаус, Быков, Айболит)

            if (error) throw error;
            setDoctors(data);
        } catch (error) {
            console.error("Ошибка загрузки врачей:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper doctors-page">
            <Header />

            <main className="doctors-content">
                <h2 className="page-title">Наши специалисты</h2>

                {loading ? (
                    <p style={{textAlign: 'center', color: '#888'}}>Загрузка лучших врачей мира...</p>
                ) : (
                    <div className="doctors-list">
                        {doctors.map((doc) => (
                            <div key={doc.id} className="doctor-card">
                                <div className="doc-photo-container">
                                    <img
                                        src={localPhotos[doc.name] || doc.image_url || defaultPhoto}
                                        alt={doc.name}
                                        className="doc-photo"
                                    />
                                </div>
                                <div className="doc-info">
                                    <h3 className="doc-name">{doc.name}</h3>
                                    <span className="doc-specialty">{doc.specialization}</span>
                                    {doc.experience && <div className="doc-exp">{doc.experience}</div>}
                                    <p className="doc-bio">{doc.bio || "Информации пока нет."}</p>

                                    <Link to="/add" className="doc-action-btn">
                                        Записаться к врачу
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Doctors;