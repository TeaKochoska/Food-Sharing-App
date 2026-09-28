import express,{Request,Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT=process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/',(req:Request,res:Response)=>{
    res.json({message:'Food Sharing Backend is running successfully!'});
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});