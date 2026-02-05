import { supabase } from "../supabaseClient";

export const getPetsByPhone = async (phone) => {
    const { data: owner } = await supabase
        .from('owners')
        .select('id, full_name')
        .eq('phone', phone)
        .single();

    if (!owner) return null;
    const { data: pets } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', owner.id)
        .order('created_at', { ascending: false });

    return { owner, pets };
};

export const getPetHistory = async (petId) => {
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            id, 
            date_time, 
            comment, 
            status,
            diagnosis,
            doctors ( name, specialization )
        `)
        .eq('pet_id', petId)
        .order('date_time', { ascending: false }); // Сначала новые

    return appointments;
};

export const createMedicalCard = async (ownerPhone, petData) => {
    let ownerId;

    const { data: existingOwner } = await supabase
        .from('owners')
        .select('id')
        .eq('phone', ownerPhone)
        .single();

    if (existingOwner) {
        ownerId = existingOwner.id;
    } else {
        const { data: newOwner, error: ownerError } = await supabase
            .from('owners')
            .insert([{ phone: ownerPhone, full_name: "Новый клиент" }]) // Имя можно спросить отдельно, но пока заглушка
            .select()
            .single();

        if (ownerError) throw ownerError;
        ownerId = newOwner.id;
    }

    const { error: petError } = await supabase
        .from('pets')
        .insert([{
            owner_id: ownerId,
            name: petData.name,
            type: petData.type,
            breed: petData.breed,
            age: petData.age,
            weight: petData.weight,
            past_injuries: petData.past_injuries,
            has_visited_before: petData.has_visited_before === 'yes'
        }]);

    if (petError) throw petError;
    return true;
};

export const deleteMedicalCard = async (petId) => {
    const { error: appError } = await supabase
        .from('appointments')
        .delete()
        .eq('pet_id', petId);

    if (appError) throw appError;
    const { error: petError } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

    if (petError) throw petError;
    return true;
};

export const updateDiagnosis = async (appointmentId, diagnosisText) => {
    const { error } = await supabase
        .from('appointments')
        .update({ diagnosis: diagnosisText, status: 'done' })
        .eq('id', appointmentId);

    if (error) throw error;
    return true;
};

export const updatePetDetails = async (petId, updates) => {
    const { error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', petId);

    if (error) throw error;
    return true;
};