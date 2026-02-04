import React, { useState } from 'react';
import Header from "../components/Header.jsx";
import { formatPhoneNumber, animalTranslations } from '../utils/formHelpers';
import * as medService from '../utils/medCardService';
import './MedCards.css';

function MedCards() {
    // --- STATE ---
    const [phone, setPhone] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [pets, setPets] = useState([]);
    const [viewMode, setViewMode] = useState('search');

    // Аккордеон
    const [expandedPetId, setExpandedPetId] = useState(null);
    const [activeHistory, setActiveHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Врач и Редактирование
    const [isDoctorMode, setIsDoctorMode] = useState(false);
    const [diagnosisInputs, setDiagnosisInputs] = useState({});

    // Состояния для РЕДАКТИРОВАНИЯ
    const [editingPetId, setEditingPetId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // Форма создания
    const [newPetData, setNewPetData] = useState({
        name: '', type: 'dog', customType: '', breed: '', age: '', weight: '',
        past_injuries: '', has_visited_before: 'no'
    });

    // --- ЛОГИКА ---
    const handlePhoneChange = (e) => setPhone(formatPhoneNumber(e.target.value));

    const handleSearch = async () => {
        if (phone.length < 10) return alert("Введите полный номер!");
        try {
            const result = await medService.getPetsByPhone(phone);
            if (result && result.pets.length > 0) {
                setPets(result.pets);
                setOwnerName(result.owner.full_name);
                setIsAuthorized(true);
                setViewMode('list');
            } else {
                if(confirm("Карт не найдено. Хотите создать новую?")) setViewMode('create');
            }
        } catch (e) {
            console.error(e);
            alert("Ошибка поиска");
        }
    };

    const togglePet = async (petId) => {
        if (expandedPetId === petId && editingPetId !== petId) {
            setExpandedPetId(null);
            return;
        }
        setExpandedPetId(petId);
        setLoadingHistory(true);
        setActiveHistory([]);

        try {
            const history = await medService.getPetHistory(petId);
            setActiveHistory(history);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingHistory(false);
        }
    };

    const startEditing = (e, pet) => {
        e.stopPropagation();
        setEditingPetId(pet.id);
        setEditFormData({
            type: pet.type,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight,
            past_injuries: pet.past_injuries
        });
        setExpandedPetId(pet.id);
    };

    const cancelEditing = () => {
        setEditingPetId(null);
        setEditFormData({});
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const savePetChanges = async (petId) => {
        try {
            await medService.updatePetDetails(petId, editFormData);
            alert("Данные обновлены!");
            setPets(pets.map(p => p.id === petId ? { ...p, ...editFormData } : p));
            setEditingPetId(null);
        } catch (e) {
            alert("Ошибка обновления: " + e.message);
        }
    };

    const handleCreateInput = (e) => setNewPetData({ ...newPetData, [e.target.name]: e.target.value });

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        const finalType = newPetData.type === 'other' ? newPetData.customType : newPetData.type;
        if (!finalType) return alert("Укажите вид животного!");
        const dataToSend = { ...newPetData, type: finalType };
        try {
            await medService.createMedicalCard(phone, dataToSend);
            alert("Карта создана!");
            const result = await medService.getPetsByPhone(phone);
            setPets(result.pets);
            setOwnerName(result.owner.full_name);
            setIsAuthorized(true);
            setViewMode('list');
            setNewPetData({ name: '', type: 'dog', customType: '', breed: '', age: '', weight: '', past_injuries: '', has_visited_before: 'no' });
        } catch (e) {
            alert("Ошибка: " + e.message);
        }
    };

    const handleDeleteCard = async (petId) => {
        if (!confirm("Вы уверены? Карта будет удалена.")) return;
        try {
            await medService.deleteMedicalCard(petId);
            const result = await medService.getPetsByPhone(phone);
            setPets(result.pets || []);
        } catch (e) { alert(e.message); }
    };

    const handleDiagnosisChange = (appId, text) => setDiagnosisInputs(prev => ({ ...prev, [appId]: text }));
    const saveDiagnosis = async (appId) => {
        const currentApp = activeHistory.find(a => a.id === appId);
        const textToSave = diagnosisInputs[appId] !== undefined ? diagnosisInputs[appId] : (currentApp.diagnosis || "");
        try {
            await medService.updateDiagnosis(appId, textToSave);
            alert("Диагноз сохранен!");
            const history = await medService.getPetHistory(expandedPetId);
            setActiveHistory(history);
            setDiagnosisInputs(prev => {
                const newState = { ...prev };
                delete newState[appId];
                return newState;
            });
        } catch (e) { alert(e.message); }
    };

    return (
        <div className="page-wrapper">
            <Header />
            {/* ГЛАВНАЯ ОБЕРТКА (как в записи на прием) */}
            <main className="content med-content">

                {/* ЗАГОЛОВОК СТРАНИЦЫ (ТЕПЕРЬ СНАРУЖИ ТЕМНОГО БЛОКА) */}
                <h2 className="page-title">Медицинские карты</h2>

                {/* ТЕМНЫЙ БЛОК НА ВСЮ ШИРИНУ */}
                <div className="med-cards-box">

                    {/* 1. ПОИСК */}
                    {viewMode === 'search' && (
                        <div className="search-section">
                            <p className="search-hint">Введите номер телефона владельца</p>
                            <input type="tel" placeholder="+7..." value={phone} onChange={handlePhoneChange} className="search-input-centered"/>
                            <button className="submit-btn" onClick={handleSearch}>Найти карты</button>
                            <button className="create-btn-large create-new-card-btn" onClick={() => setViewMode('create')}>Создать новую карту</button>
                        </div>
                    )}

                    {/* 2. СПИСОК КАРТ */}
                    {viewMode === 'list' && (
                        <div className="pets-list">
                            <div className="doctor-mode-toggle">
                                <label style={{display:'flex', alignItems:'center', gap:'5px', cursor:'pointer'}}>
                                    <input type="checkbox" checked={isDoctorMode} onChange={(e) => setIsDoctorMode(e.target.checked)} />
                                    Режим врача
                                </label>
                            </div>

                            <div className="list-top-bar">
                                <span className="owner-label">Владелец: {ownerName || phone}</span>
                                <span className="logout-link" onClick={() => {setIsAuthorized(false); setViewMode('search'); setPhone('');}}>Выйти</span>
                            </div>

                            {pets.map(pet => (
                                <div key={pet.id} className="pet-card">
                                    <div className="pet-header" onClick={() => togglePet(pet.id)}>
                                        <div>
                                            <div className="pet-name">{pet.name}</div>
                                            <div className="pet-info-short">
                                                {editingPetId === pet.id
                                                    ? <span style={{color:'#eebb00'}}>Редактирование...</span>
                                                    : `${animalTranslations[pet.type] || pet.type}, ${pet.breed || 'Без породы'}`
                                                }
                                            </div>
                                        </div>
                                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                            {isDoctorMode && editingPetId !== pet.id && (
                                                <button onClick={(e) => startEditing(e, pet)} style={{background:'none', border:'1px solid #666', color:'#ccc', borderRadius:'4px', cursor:'pointer'}}>✏️</button>
                                            )}
                                            <div className={`arrow ${expandedPetId === pet.id ? 'open' : ''}`}>▼</div>
                                        </div>
                                    </div>

                                    <div className={`pet-details ${expandedPetId === pet.id ? 'open' : ''}`}>
                                        <div className="details-content">
                                            {editingPetId === pet.id ? (
                                                <div className="edit-form-block" style={{marginBottom:'20px', padding:'10px', background:'#222', borderRadius:'8px'}}>
                                                    <div className="stats-grid">
                                                        <div className="stat-item"><span>Вид</span><input name="type" className="edit-input" value={editFormData.type} onChange={handleEditChange} /></div>
                                                        <div className="stat-item"><span>Порода</span><input name="breed" className="edit-input" value={editFormData.breed} onChange={handleEditChange} /></div>
                                                        <div className="stat-item"><span>Возраст</span><input name="age" className="edit-input" value={editFormData.age} onChange={handleEditChange} /></div>
                                                        <div className="stat-item"><span>Вес</span><input name="weight" className="edit-input" value={editFormData.weight} onChange={handleEditChange} /></div>
                                                        <div className="stat-item full-width"><span>Особенности</span><textarea name="past_injuries" className="edit-textarea" rows="3" value={editFormData.past_injuries} onChange={handleEditChange} /></div>
                                                    </div>
                                                    <div style={{display:'flex', gap:'10px'}}>
                                                        <button className="save-pet-btn" style={{background:'#555'}} onClick={cancelEditing}>Отмена</button>
                                                        <button className="save-pet-btn" onClick={() => savePetChanges(pet.id)}>Сохранить</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="stats-grid">
                                                    <div className="stat-item"><span>Возраст</span><strong>{pet.age || '-'}</strong></div>
                                                    <div className="stat-item"><span>Вес</span><strong>{pet.weight ? pet.weight + ' кг' : '-'}</strong></div>
                                                    <div className="stat-item full-width"><span>Особенности</span><strong>{pet.past_injuries || 'Нет'}</strong></div>
                                                </div>
                                            )}

                                            <h4 className="history-title">История посещений</h4>
                                            {loadingHistory ? (
                                                <p className="history-loading">Загрузка...</p>
                                            ) : activeHistory.length > 0 ? (
                                                activeHistory.map(app => (
                                                    <div key={app.id} className="history-item">
                                                        <div className="history-date">{new Date(app.date_time).toLocaleDateString()}</div>
                                                        <div className="history-doc">Врач: {app.doctors?.name}</div>
                                                        <div style={{marginTop:'5px', color:'#aaa', fontSize:'13px'}}>Обращение: {app.comment || "Нет"}</div>
                                                        <div style={{marginTop:'10px', padding:'10px', background:'#222', borderRadius:'5px'}}>
                                                            <span style={{color:'#8db580', fontSize:'12px', display:'block'}}>Врачебное заключение:</span>
                                                            {app.diagnosis ? <div style={{color:'#fff'}}>{app.diagnosis}</div> : <div style={{color:'#555', fontStyle:'italic'}}>Ожидает заполнения...</div>}
                                                            {isDoctorMode && (
                                                                <div style={{marginTop:'10px', borderTop:'1px solid #444', paddingTop:'5px'}}>
                                                                    <textarea className="edit-textarea" placeholder="Введите диагноз..." value={diagnosisInputs[app.id] !== undefined ? diagnosisInputs[app.id] : (app.diagnosis || '')} onChange={(e) => handleDiagnosisChange(app.id, e.target.value)} />
                                                                    <button className="doctor-btn" onClick={() => saveDiagnosis(app.id)}>Сохранить</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="history-empty">Истории приемов пока нет.</p>
                                            )}
                                            <button className="delete-card-btn" onClick={(e) => { e.stopPropagation(); handleDeleteCard(pet.id); }}>Удалить медицинскую карту</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="create-btn-large" onClick={() => setViewMode('create')}>+ Добавить еще питомца</button>
                        </div>
                    )}

                    {/* 3. ФОРМА СОЗДАНИЯ */}
                    {viewMode === 'create' && (
                        <form className="appointment-form" onSubmit={handleCreateSubmit}>
                            <h3 className="form-title">Новая карта</h3>
                            <div className="form-group"><label>Телефон владельца</label><input type="tel" value={phone} onChange={handlePhoneChange} required /></div>
                            <div className="form-group"><label>Кличка</label><input name="name" value={newPetData.name} onChange={handleCreateInput} required /></div>
                            <div className="form-group"><label>Кто это?</label><select name="type" value={newPetData.type} onChange={handleCreateInput}><option value="dog">Собака</option><option value="cat">Кошка</option><option value="bird">Птица</option><option value="other">Другое</option></select></div>
                            {newPetData.type === 'other' && (<div className="form-group"><input name="customType" placeholder="Вид животного" value={newPetData.customType} onChange={handleCreateInput} required /></div>)}
                            <div className="form-group"><label>Порода</label><input name="breed" value={newPetData.breed} onChange={handleCreateInput} /></div>
                            <div style={{display:'flex', gap:'10px'}}><div className="form-group" style={{flex:1}}><label>Возраст</label><input name="age" value={newPetData.age} onChange={handleCreateInput} /></div><div className="form-group" style={{flex:1}}><label>Вес</label><input name="weight" value={newPetData.weight} onChange={handleCreateInput} /></div></div>
                            <div className="form-group"><label>Хронические болезни</label><textarea name="past_injuries" value={newPetData.past_injuries} onChange={handleCreateInput} rows="2" /></div>
                            <div className="form-actions"><button type="button" onClick={() => setViewMode('search')} className="submit-btn cancel-btn">Отмена</button><button type="submit" className="submit-btn">Создать карту</button></div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}

export default MedCards;