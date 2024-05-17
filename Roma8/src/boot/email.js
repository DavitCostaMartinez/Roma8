import emailjs from "@emailjs/browser";

emailjs.init("fzahUuaxpIVpt05vk");

export async function sendEmail(emails, formData) {
    try {
        const serviceID = "default_service";
        const templateID = "template_u7wjtqm";

        for (const email of emails) {
            console.log(email);
            await emailjs.send(serviceID, templateID, { ...formData, email });
        }
        return true;
    } catch (error) {
        throw new Error("Error al enviar el correo electrónico: " + error.message);
    }
}