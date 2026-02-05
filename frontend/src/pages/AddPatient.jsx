import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header.jsx";
import '../index.css';
import './AddPatient.css';
import { formatPhoneNumber, animalTranslations } from '../utils/formHelpers';
import * as api from '../utils/appointmentService';

function AddPatient() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("new");
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [myPets, setMyPets] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    const [searchPhone, setSearchPhone] = useState('');
    const [isPetsFound, setIsPetsFound] = useState(false);
    const [selectedPetId, setSelectedPetId] = useState("");

    const [formData, setFormData] = useState({
        ownerName: '', phone: '',
        petName: '', petType: 'dog',
        petBreed: '', petAge: '',
        date: '', time: '',
        doctor_id: '', comment: '',
    });

    useEffect(() => {
        const loadInit = async () => {
            const { doctors } = await api.fetchInitialData();
            if (doctors) setDoctors(doctors);

            const savedPhone = localStorage.getItem('userPhone');
            if (savedPhone) setSearchPhone(savedPhone);
        };
        loadInit();
    }, []);

    useEffect(() => {
        if (!formData.date || !formData.doctor_id) {
            setAvailableSlots([]);
            return;
        }
        calculateSlots();
    }, [formData.date, formData.doctor_id]);

    const calculateSlots = async () => {
        setLoadingSlots(true);
        setFormData(prev => ({ ...prev, time: '' }));

        try {
            const busyTimes = await api.getBusySlots(formData.doctor_id, formData.date);
            const doctor = doctors.find(doc => doc.id.toString() === formData.doctor_id.toString());

            if (!doctor) return;

            const slots = [];
            const now = new Date();
            const isToday = formData.date === now.toISOString().split('T')[0];
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            for (let hour = doctor.work_start_hour; hour < doctor.work_end_hour; hour++) {
                for (let min of ["00", "30"]) {
                    const timeString = `${hour}:${min}`;
                    if (busyTimes.includes(timeString)) continue;
                    if (isToday) {
                        if (hour < currentHour) continue;
                        if (hour === currentHour && parseInt(min) < currentMinute) continue;
                    }
                    slots.push(timeString);
                }
            }
            setAvailableSlots(slots);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneInput = (e, isSearch = false) => {
        const formatted = formatPhoneNumber(e.target.value);
        if (isSearch) setSearchPhone(formatted);
        else setFormData(prev => ({ ...prev, phone: formatted }));
    };

    const handleFindClient = async () => {
        if (searchPhone.length < 5) return alert("Введите корректный номер!");

        try {
            const result = await api.findClientByPhone(searchPhone);
            if (!result) {
                alert("Клиент не найден. Заполните форму как новый пациент.");
                resetSearch();
            } else {
                setMyPets(result.pets || []);
                setFormData(prev => ({ ...prev, ownerName: result.owner.full_name, phone: searchPhone }));
                setIsPetsFound(true);
            }
        } catch (e) {
            alert("Ошибка поиска: " + e.message);
        }
    };

    const resetSearch = () => {
        setIsPetsFound(false);
        setMyPets([]);
        setSearchPhone('');
        setSelectedPetId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.time || !formData.doctor_id) return alert("Выберите врача, дату и время!");
        if (activeTab === "existing" && !selectedPetId) return alert("Выберите питомца!");

        try {
            await api.createAppointment(formData, activeTab === "new", selectedPetId);

            alert("Вы успешно записаны!");
            localStorage.setItem('userPhone', formData.phone);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <div className="page-wrapper">
            <Header />
            <main className="content appointment-content">
                <h2 className="page-title">Запись на прием</h2>

                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>Новый пациент</button>
                    <button className={`tab-btn ${activeTab === 'existing' ? 'active' : ''}`} onClick={() => setActiveTab('existing')}>У меня есть карта</button>
                </div>

                <form className="appointment-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Ваше имя</label>
                        <input name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="Иван" required />
                    </div>
                    <div className="form-group">
                        <label>Телефон</label>
                        <input type="tel" value={formData.phone} onChange={(e) => handlePhoneInput(e)}
                               placeholder="+7 (999) 888-55-33" required maxLength={18}/>
                    </div>

                    {activeTab === 'new' ? (
                        <>
                            <div className="form-group"><label>Кличка</label><input name="petName" value={formData.petName}
                                                                                    onChange={handleInputChange} required placeholder="Бобик"/></div>
                            <div className="form-group"><label>Порода</label><input name="petBreed" value={formData.petBreed}
                                                                                    onChange={handleInputChange} placeholder="Овчарка"/></div>
                            <div className="form-group"><label>Возраст</label><input name="petAge" value={formData.petAge}
                                                                                     onChange={handleInputChange} placeholder="5 лет"/></div>
                            <div className="form-group"><label>Вид</label>
                                <select name="petType" value={formData.petType} onChange={handleInputChange}>
                                    <option value="dog">Собака</option>
                                    <option value="cat">Кошка</option>
                                    <option value="bird">Птица</option>
                                    <option value="other">Другое</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            {!isPetsFound ? (
                                <div className="search-box">
                                    <div className="search-row">
                                        <input type="tel" value={searchPhone} onChange={(e) =>
                                            handlePhoneInput(e, true)} placeholder="Номер для поиска" />
                                        <button type="button" onClick={handleFindClient} className="submit-btn search-btn">Найти</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <div className="label-row">
                                        <label>Выберите питомца</label>
                                        <span onClick={resetSearch} className="reset-link">Сбросить</span>
                                    </div>
                                    <select className="pet-select" value={selectedPetId} onChange={(e) =>
                                        setSelectedPetId(e.target.value)}>
                                        <option value="">-- Список --</option>
                                        {myPets.map(pet => (
                                            <option key={pet.id} value={pet.id}>{pet.name} ({animalTranslations[pet.type] || pet.type})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    <hr className="divider"/>

                    <div className="form-group">
                        <label>Врач</label>
                        <select name="doctor_id" value={formData.doctor_id} onChange={handleInputChange} required className="doctor-select">
                            <option value="">-- Выберите врача --</option>
                            {doctors.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Дата</label>
                        <input type="date" name="date" value={formData.date} onChange={handleInputChange} required min={new Date().toISOString().split('T')[0]} />
                    </div>

                    {formData.date && formData.doctor_id && (
                        <div className="time-slots-grid">
                            {!loadingSlots && availableSlots.length > 0 ? availableSlots.map(time => (
                                <button key={time} type="button" className={`time-btn ${formData.time === time ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, time })}>
                                    {time}
                                </button>
                            )) : <p className="no-slots">{loadingSlots ? "Загрузка..." : "Нет мест"}</p>}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Комментарий</label>
                        <textarea name="comment" value={formData.comment} onChange={handleInputChange} rows="3" />
                    </div>

                    <button type="submit" className="submit-btn">Записаться</button>
                </form>
            </main>
        </div>
    );
}

export default AddPatient;