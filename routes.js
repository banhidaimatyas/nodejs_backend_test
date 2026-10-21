const express = require('express');
const { OneSide, ManySide } = require('./models');

const router = express.Router()

router.post('/new', async (req, res) => {
    try{
        const ujTelefon = await ManySide.create(req.body);
        res.status(201).json({"_id": ujTelefon._id})
    }
    catch(error){
        if (error.name === 'ValidationError') {
            return res.status(400).json({message: "Hiányos vagy érvénytelen adatok"})
        }

        if (error.code === 11000) {
            return res.status(409).json({message: "Már létezik ilyen telefon"})
        }

        console.error(error)
        res.status(500).json({message: "Szerver hiba"})
    }
})

router.get('/manyside', async (req, res) => {
    try{
        const data = await ManySide.find().populate('foreignId', '-_id');
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/manyside/:id', async (req, res) => {
    try{
        const data = await ManySide.findById(req.params.id)
        .populate('foreignId', '-_id')
        if (data) {
            res.json(data)
        } else {
            res.status(404).json({message: 'Nincs ilyen azonosítóval rendelkező elem.'})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.patch('/manyside/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { returnDocument: 'after', runValidators: true }; 
        // hogy a frissítés utáni dokumentumot kapjuk vissza
        const result = await ManySide.findByIdAndUpdate(
            id, updatedData, options
        )
        if (result) {
            res.send(result)
        } else {
            res.status(404).json({ message: `${id} azonosítóval nem létezik elem!`  })
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.delete('/manyside/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await ManySide.findByIdAndDelete(id)
        res.send(`A ${data.nev} nevű elem törölve lett.`)
	// Ha csak a 204-es státuszkódot akarod visszaküldeni, akkor: res.sendStatus(204)!
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;



// const express = require('express');
// const { Todo } = require('./models');

// const router = express.Router();

// // Create a task
// router.post('/todos', async (req, res) => {
//     try {
//         const todo = await Todo.create(req.body);
//         res.status(201).json({ _id: todo._id });
//     } catch (error) {
//         if (error.name === 'ValidationError') {
//             return res.status(400).json({
//                 message: 'Hiányos vagy érvénytelen adatok'
//             });
//         }

//         if (error.code === 11000) {
//             return res.status(409).json({
//                 message: 'Már létezik ilyen feladat'
//             });
//         }

//         res.status(500).json({ message: 'Szerver hiba' });
//     }
// });

// // Get all tasks
// router.get('/todos', async (req, res) => {
//     try {
//         const todos = await Todo.find();
//         res.status(200).json(todos);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Get one task
// router.get('/todos/:id', async (req, res) => {
//     try {
//         const todo = await Todo.findById(req.params.id);

//         if (!todo) {
//             return res.status(404).json({
//                 message: 'Nincs ilyen feladat.'
//             });
//         }

//         res.status(200).json(todo);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Update a task
// router.patch('/todos/:id', async (req, res) => {
//     try {
//         const todo = await Todo.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { returnDocument: 'after', runValidators: true }
//         );

//         if (!todo) {
//             return res.status(404).json({
//                 message: 'Nincs ilyen feladat.'
//             });
//         }

//         res.status(200).json(todo);
//     } catch (error) {
//         if (error.name === 'ValidationError') {
//             return res.status(400).json({
//                 message: 'Hiányos vagy érvénytelen adatok'
//             });
//         }

//         res.status(500).json({ message: error.message });
//     }
// });

// // Delete a task
// router.delete('/todos/:id', async (req, res) => {
//     try {
//         const todo = await Todo.findByIdAndDelete(req.params.id);

//         if (!todo) {
//             return res.status(404).json({
//                 message: 'Nincs ilyen feladat.'
//             });
//         }

//         res.status(200).json({
//             message: 'Feladat törölve.',
//             _id: todo._id
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// module.exports = router;
