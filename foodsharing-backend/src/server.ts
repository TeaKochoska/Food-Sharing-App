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

//POST ROUTE: Create a new meal for a specific restaurant
app.post('/api/meals' ,async (req,res) => {
    try{
        const{
            restaurantId,
            mealName,
            description,
            imageUrl,
            pickupStartTime,
            pickupEndTime,
            pickupDate,
            originalPrice,
            discountedPrice,
            availableQuantity
        } = req.body;

        if( !restaurantId || !mealName || !pickupStartTime || !pickupEndTime || !pickupDate || originalPrice === undefined || discountedPrice === undefined){
            return res.status(400).json({ error: 'Missing required fields for the meal!' });
        }

        const restaurantExists=await prisma.restaurant.findUnique({
            where: {id: restaurantId}
        });

        if(!restaurantExists){
            return res.status(404).json({ error: 'Restaurant not found!' })
        }

        const newMeal = await prisma.meal.create({
            data: {
                restaurantId,
                mealName,
                description,
                imageUrl: imageUrl || '',
                pickupStartTime,
                pickupEndTime,
                pickupDate,
                originalPrice: parseFloat(originalPrice),
                discountedPrice: parseFloat(discountedPrice),
                availableQuantity: availableQuantity !== undefined ? parseInt(availableQuantity) : 1
            },
        });

        res.status(201).json({
            message: 'Meal created successfully!',
            meal: newMeal,
        });
    }catch (error){
        console.error('Error creating meal:', error);
        res.status(500).json({ error: 'Internal server error'})
    }
});

//GET ROUTE:Get all meals (or meals filtered by restaurant id)
app.get('/api/meals' ,async(req,res) => {
    try{
        const meals=await prisma.meal.findMany({
            include:{
                restaurant:true //automatically puts the data for the restaurant in the response
            }
        });

        res.status(200).json({
            message: 'Meals fetched successfully!',
            count :meals.length,
            meals
        });
    }catch(error){
        console.error('Error fetching meals:', error);
        res.status(500).json({ error: 'Internal server error' })
    }
});

//PUT ROUTE: Update a meal by id
app.put('/api/meals/:id' , async(req,res) =>{
    try{
        const {id}= req.params;
        const{
            mealName,
            description,
            imageUrl,
            pickupStartTime,
            pickupEndTime,
            pickupDate,
            originalPrice,
            discountedPrice,
            availableQuantity
        }=req.body;

        const updatedMeal=await prisma.meal.update({
            where:{id:id},
            data: {
                mealName,
                description,
                imageUrl,
                pickupStartTime,
                pickupEndTime,
                pickupDate,
                originalPrice: originalPrice !== undefined ? parseFloat(originalPrice) : undefined,
                discountedPrice: discountedPrice !== undefined ? parseFloat(discountedPrice) : undefined,
                availableQuantity: availableQuantity !== undefined ? parseInt(availableQuantity) : undefined
            },
        });

        res.status(200).json({
            message: 'Meal updated successfully!',
            meal:updatedMeal
        });
    }catch(error){
        console.error('Error updating meal:', error);
        res.status(500).json({ error: 'Meal not found or internal server error'});
    }
});

//DELETE ROUTE:Delete a meal by ID
app.delete('/api/meals/:id', async(req,res) => {
    try{
        const {id} =req.params;
        await prisma.meal.delete({
            where:{id:id},
        });

        res.status(200).json({
            message: 'Meal deleted successfully!',
        });
    }catch(error){
        console.error('Error deleting meal:', error);
        res.status(500).json({ error: 'Meal not found or internal server error'})
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});