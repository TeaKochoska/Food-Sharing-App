import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db';
import { count } from 'node:console';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// test route
app.get('/', (req, res) => {
    res.send('Food Sharing API is running successfully!');
});

//NEW ROUTE: Create a restaurant
app.post('/api/restaurants', async (req, res) => {
    try {
        const { name, address, latitude, longitude} = req.body;

        // Validation
        if (!name || !address || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'Name, address, latitude, longitude are required!' });
        }

        // Saving to database via Prisma
        const newRestaurant = await prisma.restaurant.create({
            data: {
                name,
                address,
                latitude: parseFloat(latitude) ,  
                longitude: parseFloat(longitude),
            },
        });

        res.status(201).json({
            message: 'Restaurant created successfully!',
            restaurant: newRestaurant,
        });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//GET all restaurants
app.get('/api/restaurants', async (req,res) => {
    try{
        const restaurants=await prisma.restaurant.findMany();

        res.status(200).json({
            message: 'Restaurants fetched successfully!',
            count: restaurants.length,
            restaurants
        });
    }catch (error){
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//PUT ROUTE :Update a restaurant by ID
app.put('/api/restaurants/:id', async(req,res) => {
    try{
        const { id } = req.params;
        const {name,address,latitude,longitude} = req.body;

        const updatedRestaurant=await prisma.restaurant.update({
            where: { id: id},
            data: {
                name,
                address,
                latitude: latitude !== undefined ? parseFloat(latitude):undefined,
                longitude: longitude !== undefined ? parseFloat(longitude):undefined,
            },
        });

        res.status(200).json({
            message: 'Restaurant updated successfully!',
            restaurant: updatedRestaurant
        });
    }catch(error){
        console.error('Error updating restaurant:', error);
        res.status(500).json({ error: 'Restaurant not found or internal server error' }); 
    }
});

//DELETE ROUTE: Delete a restaurant by ID
app.delete('/api/restaurants/:id' , async(req,res) => {
    try{
        const {id}=req.params;
        await prisma.restaurant.delete({
            where: {id: id },
        });

        res.status(200).json({
            message: 'Restaurant deleted successfully!',
        });

    }catch(error){
        console.error('Error deleting restaurant:', error);
        res.status(500).json({ error: 'Restaurant not found or internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});