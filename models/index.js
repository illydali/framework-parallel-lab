const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Poster', {
    tableName: 'posters',
    media_property() {
        return this.belongsTo('Media_Property')
    },
    tags() {
        return this.belongsToMany('Tag')
    }
});

const Media_Property = bookshelf.model('Media_Property', {
    tableName: 'media_properties',
    poster() {
        return this.hasMany('Poster')
    }
})

const Tag = bookshelf.model('Tag',{
    tableName: 'tags',
    posters() {
        return this.belongsToMany('Poster')
    }
})

const User = bookshelf.model('User', {
    tableName: 'users',
})

const CartItem = bookshelf.model('CartItem', {
    tableName: 'cart_items',
    poster() {
        return this.belongsTo('Poster')
    },
    user:function(){
        return this.belongsTo('User');
    }
})

const BlacklistedToken = bookshelf.model('BlacklistedToken', {
    tableName: 'blacklisted_tokens',
})

module.exports = {
    Poster,
    Media_Property,
    Tag,
    User,
    CartItem,
    BlacklistedToken
};