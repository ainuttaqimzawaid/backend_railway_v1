const { Tags } = require('../Assosiation/Model');

const index = async (req, res, next) => {
    try {
        await Tags.sync();
        const { search } = req.query;
        let tag = '';
        if (search) {
            tag = await Tags.findAll({
                where: {
                    name: {
                        [Op.like]: `%${search}%`
                    }
                }
            })
            return res.json(tag)
        } else {
            let tag = await Tags.findAll();
            return res.json(tag);
        }
    } catch (err) {
        next(err);
    }
};

const view = async (req, res, next) => {
    try {
        id = req.params.id;
        let tag = await Tags.findOne({
            where: {
                id
            }
        });
        return res.json(tag);
    } catch (err) {
        next(err)
    }
};

const store = async (req, res, next) => {
    try {
        let tag;

        if (Array.isArray(req.body)) {
            // Bulk insert
            tag = await Tags.bulkCreate(req.body);
        } else {
            // Single insert
            const { name } = req.body;
            categories = await Tags.create({ name });
        }
        return res.json(tag);
    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }
        next(err);
    }
}

const update = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name } = req.body;
        let tag = await Tags.findByPk(id);
        tag = await tag.update({ name });
        return res.json(tag);
    } catch (err) {
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }
        next(err);
    }
};

const destroy = async (req, res) => {
    const id = req.params.id;
    try {
        // Cari buku berdasarkan ID
        let tag = await Tags.findByPk(id);

        await Tags.destroy({
            where: { id }
        })
        return res.json({ tag, message: 'tag successfully deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    index,
    view,
    store,
    update,
    destroy,
}