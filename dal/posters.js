const {
    Poster,
    Media_Property,
    Tag
} = require('../models')

async function getPosterId(posterId) {
    // eqv of
    // select * from posters where id = ${posterId}
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        'require': true,
        'withRelated': ['media_property', 'tags']
    })
    return poster;
}


async function getAllProperties() {
    const allProps = await Media_Property.fetchAll().map(media => {
        return [media.get('id'), media.get('name')]
    })
    return allProps;
}

async function getAllTags() {
    const allTags = await Tag.fetchAll().map(tag => {
        return [tag.get('id'), tag.get('name')]
    })
    return allTags;
}

async function getAllPosters() {
    return await Poster.fetchAll();
}

module.exports = {
    getAllProperties,
    getAllTags,
    getPosterId,
    getAllPosters
}