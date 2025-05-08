import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
// import userRoutes from './routes/userRoutes';
import contentRoutes from './routes/contentRoutes';
import encyclopediaRoutes from './routes/encyclopedia';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' })); // Increase the limit to 10mb
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
}));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the backend!');
});

// app.use('/api', userRoutes);
app.use('/api', contentRoutes);


// app.use('/plants', plantRoutes);

app.use('/encyclopedia', encyclopediaRoutes)

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
