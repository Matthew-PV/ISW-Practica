// Arranque del servidor (npm run dev / npm start). La configuración está en app.js.
const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`PlanB escuchando en http://localhost:${port}`);
});
