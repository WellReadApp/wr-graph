import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.json('Welcome to WellRead Graph V0');
});

export default app;
