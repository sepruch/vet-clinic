import { supabase } from "../supabaseClient";


export const fetchInitialData = async () => {
    const { data: pets } = await supabase.from('pets').select('*');
    const { data: doctors } = await supabase.from('doctors').select('*');
    return { pets, doctors };
};

export const findClientByPhone = async (phone) => {
    const { data: owner } = await supabase
        .from('owners')
        .select('id, full_name')
        .eq('phone', phone)
        .single();

    if (!owner) return null;

    const { data: pets } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', owner.id);

    return { owner, pets };
};

export const getBusySlots = async (doctorId, date) => {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data } = await supabase
        .from('appointments')
        .select('date_time')
        .eq('doctor_id', doctorId)
        .gte('date_time', startOfDay)
        .lte('date_time', endOfDay);

    return data.map(app => app.date_time.split('T')[1].slice(0, 5));
};

export const createAppointment = async (formData, isNewClient, selectedPetId) => {
    let finalPetId = selectedPetId;
    if (isNewClient) {
        const { data: owner, error: ownerError } = await supabase
            .from('owners')
            .insert([{ full_name: formData.ownerName, phone: formData.phone }])
            .select().single();

        if (ownerError) throw new Error("Ошибка создания владельца: " + ownerError.message);
        const { data: pet, error: petError } = await supabase
            .from('pets')
            .insert([{
                name: formData.petName,
                type: formData.petType,
                breed: formData.petBreed,
                age: formData.petAge,
                owner_id: owner.id
            }])
            .select().single();

        if (petError) throw new Error("Ошибка создания питомца: " + petError.message);
        finalPetId = pet.id;
    }

    const finalDateTime = `${formData.date}T${formData.time}:00`;
    const { error: appError } = await supabase
        .from('appointments')
        .insert([{
            pet_id: finalPetId,
            doctor_id: formData.doctor_id,
            date_time: finalDateTime,
            comment: formData.comment,
            status: 'new'
        }]);

    if (appError) throw new Error("Ошибка записи на прием: " + appError.message);
    return true;
};