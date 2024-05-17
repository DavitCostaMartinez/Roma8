/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const nodemailer = require("nodemailer");

admin.initializeApp();

exports.deleteUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const userId = req.params.userId;
      console.log("El id de los cojones: ", userId)

      const userSnapshot = await admin.database().ref(`/users/${userId}`).once('value');
      console.log(userSnapshot)
      const userData = userSnapshot.val();
      const userUid = userData.uid;
      await admin.auth().deleteUser(userUid);

      // Eliminar el usuario de la base de datos de Firebase Realtime
      await admin.database().ref(`/users/${userId}`).remove();

      res.status(200).send('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      res.status(500).send('Error al eliminar el usuario');
    }
  });
});

exports.sendByeEmail = functions.auth.user().onDelete(async (user) => {
  try {
    const userId = user.uid;
    console.log("Hola mundo: ", userId);
    const userSnapshot = await admin.database().ref(`/users/${userId}`).once('value');
    const userData = userSnapshot.val();
    const userEmail = userData.email;
    console.log(`Correo electrónico de despedida enviado a: ${userEmail}`);
  } catch (error) {
    console.error('Error al enviar el correo electrónico de despedida:', error);
  }
});

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "avchaparro04@gmail.com",
    pass: "kko",
  },
});

const sendForm = (form) => {
  return transport
    .sendMail({
      from: "Pepe <avchaparro04@gmail.com>",
      to: form.email,
      subject: "👾🤖Nuevo mensaje de tu formulario de contacto😎",
      html: `<h3>¡Tienes un nuevo mensaje!</h3>
    <p> Nombre: ${form.name} </p>
    <p>Descripción: ${form.description} </p>
    `,
    })
    .then((r) => {
      console.log("Accepted => ", r.accepted)
    })
    .catch((e) => console.log(e))
}

exports.sendFormEmail = functions.https.onRequest((request, response) => {
  if (request.body.secret !== "firebaseIsCool") return response.send("Missing secret");
  sendForm(request.body);
  response.send("Enviando correo electronico....")
});
