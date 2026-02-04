export const animalTranslations = {
    dog: 'Собака',
    cat: 'Кошка',
    bird: 'Птица',
    other: 'Другое'
};

export const formatPhoneNumber = (value) => {
    if (!value) return "";

    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";

    let numberBody = numbers;
    if (["7", "8"].includes(numbers[0])) numberBody = numbers.slice(1);
    numberBody = numberBody.slice(0, 10);

    let formatted = "+7";
    if (numberBody.length > 0) formatted += ` (${numberBody.substring(0, 3)}`;
    if (numberBody.length >= 4) formatted += `) ${numberBody.substring(3, 6)}`;
    if (numberBody.length >= 7) formatted += `-${numberBody.substring(6, 8)}`;
    if (numberBody.length >= 9) formatted += `-${numberBody.substring(8, 10)}`;

    return formatted;
};