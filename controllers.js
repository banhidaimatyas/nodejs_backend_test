const { ManySide } = require('./models');

const createItem = async (req, res) => {
    try {
        const ujTelefon = await ManySide.create(req.body);
        res.status(201).json({ _id: ujTelefon._id });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Hiányos vagy érvénytelen adatok' });
        }

        if (error.code === 11000) {
            return res.status(409).json({ message: 'Már létezik ilyen telefon' });
        }

        console.error(error);
        res.status(500).json({ message: 'Szerver hiba' });
    }
};

const getManySide = async (req, res) => {
    try {
        const data = await ManySide.find().populate('foreignId', '-_id');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getManySideById = async (req, res) => {
    try {
        const data = await ManySide.findById(req.params.id)
            .populate('foreignId', '-_id');
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ message: 'Nincs ilyen azonosítóval rendelkező elem.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateManySide = async (req, res) => {
    try {
        const { id } = req.params;
        const options = { returnDocument: 'after', runValidators: true };
        const result = await ManySide.findByIdAndUpdate(id, req.body, options);
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: `${id} azonosítóval nem létezik elem!` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteManySide = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await ManySide.findByIdAndDelete(id);
        if (!data) {
            return res.status(404).json({ message: 'Nincs ilyen azonosítóval rendelkező elem.' });
        }
        res.status(200).send(`A ${data.nev} nevű elem törölve lett.`);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createItem,
    getManySide,
    getManySideById,
    updateManySide,
    deleteManySide
};
