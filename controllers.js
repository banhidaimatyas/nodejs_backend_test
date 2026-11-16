const { ManySide } = require("./models");

const NOT_FOUND_MESSAGE = "Nincs ilyen azonosítóval rendelkező elem.";

// Errors caused by the client's request (not by the server) -> 4xx
const knownError = (error) => {
    if (error.name === "CastError") {
        return { status: 400, message: "Érvénytelen azonosító" };
    }
    if (error.name === "ValidationError") {
        return { status: 400, message: "Hiányos vagy érvénytelen adatok" };
    }
    if (error.code === 11000) {
        return { status: 409, message: "Már létezik ilyen telefon" };
    }
    return null;
};

const createItem = async (req, res) => {
    try {
        const ujTelefon = await ManySide.create(req.body);
        res.status(201).json({ _id: ujTelefon._id });
    } catch (error) {
        const known = knownError(error);
        if (known) {
            return res.status(known.status).json({ message: known.message });
        }

        console.error(error);
        res.status(500).json({ message: "Szerver hiba" });
    }
};

const getManySide = async (req, res) => {
    try {
        const data = await ManySide.find().populate("foreignId", "-_id");
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getManySideById = async (req, res) => {
    try {
        const data = await ManySide.findById(req.params.id).populate(
            "foreignId",
            "-_id",
        );
        if (!data) {
            return res.status(404).json({ message: NOT_FOUND_MESSAGE });
        }
        res.status(200).json(data);
    } catch (error) {
        const known = knownError(error);
        if (known) {
            return res.status(known.status).json({ message: known.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const updateManySide = async (req, res) => {
    try {
        const { id } = req.params;
        const options = { returnDocument: "after", runValidators: true };
        const result = await ManySide.findByIdAndUpdate(id, req.body, options);
        if (!result) {
            return res.status(404).json({ message: NOT_FOUND_MESSAGE });
        }
        res.status(200).json(result);
    } catch (error) {
        const known = knownError(error);
        if (known) {
            return res.status(known.status).json({ message: known.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const deleteManySide = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await ManySide.findByIdAndDelete(id);
        if (!data) {
            return res.status(404).json({ message: NOT_FOUND_MESSAGE });
        }
        res.status(200).send(`A ${data.nev} nevű elem törölve lett.`);
    } catch (error) {
        const known = knownError(error);
        if (known) {
            return res.status(known.status).json({ message: known.message });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createItem,
    getManySide,
    getManySideById,
    updateManySide,
    deleteManySide,
};
